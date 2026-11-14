// Copies every row (all statuses) from the two Notion databases into D1.
// Safe to rerun: rows are matched by Notion page id and updated in place.
// A group or event edited in /admin after its last Notion edit keeps the admin version.
// Never deletes; rows in D1 that are no longer in Notion are only listed.
//
//   npm run import:local    (local copy, for testing)
//   npm run import          (the real database on Cloudflare)

import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client, collectPaginatedAPI, isFullPage } from "@notionhq/client";
import { d1, query as d1query } from "./d1.mjs";

const ORGS_SOURCE = "db1b67aa-be6e-453c-9481-4e2c9549f87a";
const EVENTS_SOURCE = "423e16f9-1f99-434c-a8c7-18853486c103";
const target = process.argv.includes("--remote") ? "--remote" : "--local";

if (!process.env.NOTION_TOKEN) {
  console.error("import: NOTION_TOKEN is not set. Add it to .env.");
  process.exit(1);
}
const notion = new Client({ auth: process.env.NOTION_TOKEN });

const text = (prop) => (prop?.rich_text ?? prop?.title ?? []).map((t) => t.plain_text).join("").trim();
const names = (prop) => (prop?.multi_select ?? []).map((o) => o.name);

// SQL value: null, number, or a quoted string.
const q = (v) =>
  v === null || v === undefined || v === "" ? "NULL"
  : typeof v === "number" ? String(v)
  : typeof v === "boolean" ? (v ? "1" : "0")
  : `'${String(v).replaceAll("'", "''")}'`;

// newerOnly: update an existing row only if Notion's copy was edited after
// D1's (both are ISO UTC times), so edits made in /admin aren't overwritten.
const upsert = (table, row, { newerOnly = false } = {}) => {
  const cols = Object.keys(row);
  const quoted = cols.map((c) => `"${c}"`);
  const updates = cols.filter((c) => c !== "id").map((c) => `"${c}" = excluded."${c}"`);
  return `INSERT INTO ${table} (${quoted.join(", ")}) VALUES (${cols.map((c) => q(row[c])).join(", ")})
ON CONFLICT(id) DO UPDATE SET ${updates.join(", ")}${newerOnly ? ` WHERE excluded.updated_at > ${table}.updated_at` : ""};`;
};

const all = async (id) =>
  (await collectPaginatedAPI(notion.dataSources.query, { data_source_id: id })).filter(isFullPage);

const wrangler = (args) => d1(target, args);
const query = (sql) => d1query(target, sql);

// ---- Read Notion

const orgPages = await all(ORGS_SOURCE);
const eventPages = await all(EVENTS_SOURCE);
const skipped = [];

const orgs = orgPages
  .map((page) => {
    const p = page.properties;
    return {
      id: page.id,
      name: text(p.Name),
      website: p.Website?.url ?? null,
      blurb: text(p.Blurb),
      category: JSON.stringify(names(p.Category)),
      area: JSON.stringify(names(p.Area)),
      status: p.Status?.select?.name ?? "Collecting",
      verified: p.Verified?.checkbox ?? false,
      found_via: p["Found via"]?.url ?? null,
      events_page: text(p["Events page"]),
      where_text: text(p.Where),
      no_fixed_place: p["No fixed place"]?.checkbox ?? false,
      created_at: page.created_time,
      updated_at: page.last_edited_time,
    };
  })
  .filter((o) => o.name || (skipped.push(`org with no Name (${o.id})`), false));

const orgIds = new Set(orgs.map((o) => o.id));

const events = eventPages
  .map((page) => {
    const p = page.properties;
    const date = p.Date?.date;
    let orgId = p.Org?.relation?.[0]?.id ?? null;
    if (orgId && !orgIds.has(orgId)) {
      skipped.push(`"${text(p.Name)}": its org isn't in the Orgs database, so it was left unlinked`);
      orgId = null;
    }
    return {
      id: page.id,
      name: text(p.Name),
      start: date?.start ?? null,
      end: date?.end ?? null,
      all_day: date?.start ? !date.start.includes("T") : false,
      link: p.Link?.url ?? null,
      org_id: orgId,
      area: JSON.stringify(names(p.Area)),
      where_text: text(p.Where),
      category: p.Category?.select?.name ?? null,
      summary: text(p.Summary),
      status: p.Status?.select?.name ?? "Collecting",
      created_at: page.created_time,
      updated_at: page.last_edited_time,
    };
  })
  .filter((e) => {
    if (!e.name) return skipped.push(`event with no Name (${e.id})`), false;
    if (!e.start) return skipped.push(`"${e.name}": no Date, not imported`), false;
    return true;
  });

// ---- Write to D1 (orgs first, since events point at them)

// Groups and events can be edited in /admin, so the newer edit wins.
const sql = [
  ...orgs.map((o) => upsert("orgs", o, { newerOnly: true })),
  ...events.map((e) => upsert("events", e, { newerOnly: true })),
].join("\n");
const file = join(mkdtempSync(join(tmpdir(), "newtonova-import-")), "import.sql");
writeFileSync(file, sql);
wrangler(["--file", file, ...(target === "--remote" ? ["--yes"] : [])]);

// ---- Report

const count = (table) =>
  Object.fromEntries(query(`SELECT status, COUNT(*) n FROM ${table} GROUP BY status`).map((r) => [r.status, r.n]));
const tally = (rows) => rows.reduce((t, r) => ((t[r.status] = (t[r.status] ?? 0) + 1), t), {});
const show = (t) => Object.entries(t).sort().map(([k, n]) => `${k} ${n}`).join(", ") || "none";

console.log(`import (${target.slice(2)}):`);
console.log(`  Notion orgs:   ${orgPages.length} → imported ${orgs.length} (${show(tally(orgs))})`);
console.log(`  D1 orgs now:   ${show(count("orgs"))}`);
console.log(`  Notion events: ${eventPages.length} → imported ${events.length} (${show(tally(events))})`);
console.log(`  D1 events now: ${show(count("events"))}`);

const notionIds = new Set([...orgPages, ...eventPages].map((p) => p.id));
const extra = [...query("SELECT id, name FROM orgs"), ...query("SELECT id, name FROM events")].filter(
  (r) => !notionIds.has(r.id),
);
if (extra.length) {
  console.log(`  In D1 but not in Notion (added in /admin, or gone from Notion; left alone): ${extra.length}`);
  for (const r of extra) console.log(`    - ${r.name} (${r.id})`);
}
if (skipped.length) {
  console.log(`  Notes (${skipped.length}):`);
  for (const s of skipped) console.log(`    - ${s}`);
}
