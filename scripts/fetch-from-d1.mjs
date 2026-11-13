// Reads Live groups and events from D1 and writes src/data/orgs.json and
// src/data/events.json for the site. Runs before every build (npm "prebuild").
// Writes only what the site shows, plus ids: never Found via, Where for orgs,
// Summary, the new detail fields, or contact info.
// Rebuilds are manual, so past events are dropped now and again in the browser.
//
//   node scripts/fetch-from-d1.mjs           (the real database)
//   node scripts/fetch-from-d1.mjs --local   (the test copy)

import { writeFileSync, mkdirSync } from "node:fs";
import { query } from "./d1.mjs";

const target = process.argv.includes("--local") ? "--local" : "--remote";
const write = (name, rows) => {
  const out = new URL(`../src/data/${name}`, import.meta.url);
  mkdirSync(new URL(".", out), { recursive: true });
  writeFileSync(out, JSON.stringify(rows, null, 2) + "\n");
};

// ---- Groups

const orgs = query(target, "SELECT id, name, website, category, area, blurb, verified FROM orgs WHERE status = 'Live'")
  .map((r) => ({
    id: r.id,
    name: r.name.trim(),
    website: r.website ?? "",
    category: JSON.parse(r.category),
    area: JSON.parse(r.area),
    blurb: r.blurb ?? "",
    status: "Live",
    verified: Boolean(r.verified),
  }))
  .filter((o) => o.name)
  .sort((a, b) => a.name.localeCompare(b.name));

for (const o of orgs) {
  if (!o.website) console.warn(`fetch: "${o.name}" has no Website`);
  if (!o.blurb) console.warn(`fetch: "${o.name}" has no Blurb`);
}
write("orgs.json", orgs);

// ---- Events

// Today's date in New York, as YYYY-MM-DD.
const todayNY = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const dayNY = (iso) =>
  iso.includes("T") ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" }) : iso;

let past = 0;
const events = query(
  target,
  `SELECT id, name, start, "end", all_day, link, org_id, area, where_text, category FROM events WHERE status = 'Live'`,
)
  .map((r) => ({
    id: r.id,
    name: r.name,
    start: r.start,
    end: r.end ?? null,
    allDay: Boolean(r.all_day),
    link: r.link ?? "",
    orgId: r.org_id ?? null,
    area: JSON.parse(r.area),
    where: r.where_text ?? "",
    category: r.category ?? null,
  }))
  .filter((e) => {
    // Keep anything still running today or later (the browser trims by the hour).
    if (dayNY(e.end ?? e.start) < todayNY) return past++, false;
    return true;
  })
  .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

for (const e of events) {
  if (!e.link) console.warn(`fetch: "${e.name}" has no Link`);
}
write("events.json", events);

console.log(`fetch: wrote ${orgs.length} Live groups and ${events.length} upcoming Live events (skipped ${past} past) from D1`);
