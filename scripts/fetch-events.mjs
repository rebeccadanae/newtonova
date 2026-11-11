// Reads Live rows from the "newtonova Events" Notion data source and writes
// src/data/events.json for the /events page. Runs before every build (npm "prebuild").
// Summary is newsletter-only and is never written here.
// Rebuilds are manual, so past events are dropped now and again in the browser.

import { writeFileSync, mkdirSync } from "node:fs";
import { Client, collectPaginatedAPI, isFullPage } from "@notionhq/client";

const DATA_SOURCE_ID = "423e16f9-1f99-434c-a8c7-18853486c103";
const OUT = new URL("../src/data/events.json", import.meta.url);

if (!process.env.NOTION_TOKEN) {
  console.error("fetch-events: NOTION_TOKEN is not set. Add it to .env (local) or the Cloudflare build variables.");
  process.exit(1);
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const text = (prop) => (prop?.rich_text ?? prop?.title ?? []).map((t) => t.plain_text).join("").trim();
const names = (prop) => (prop?.multi_select ?? []).map((o) => o.name);

// Today's date in New York, as YYYY-MM-DD.
const todayNY = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const dayNY = (iso) =>
  iso.includes("T") ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "America/New_York" }) : iso;

const rows = await collectPaginatedAPI(notion.dataSources.query, {
  data_source_id: DATA_SOURCE_ID,
  filter: { property: "Status", select: { equals: "Live" } },
});

let past = 0;
const events = rows
  .filter(isFullPage)
  .map((page) => {
    const p = page.properties;
    const date = p.Date?.date;
    return {
      id: page.id,
      name: text(p.Name),
      start: date?.start ?? "",
      end: date?.end ?? null,
      allDay: date?.start ? !date.start.includes("T") : false,
      link: p.Link?.url ?? "",
      orgId: p.Org?.relation?.[0]?.id ?? null,
      area: names(p.Area),
      where: text(p.Where),
      category: p.Category?.select?.name ?? null,
    };
  })
  .filter((e) => {
    if (!e.name || !e.start) {
      console.warn(`fetch-events: skipping a Live row with no ${e.name ? "Date" : "Name"}${e.name ? `: "${e.name}"` : ""}`);
      return false;
    }
    // Keep anything still running today or later (the browser trims by the hour).
    if (dayNY(e.end ?? e.start) < todayNY) {
      past++;
      return false;
    }
    return true;
  })
  .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));

for (const e of events) {
  if (!e.link) console.warn(`fetch-events: "${e.name}" has no Link`);
}

mkdirSync(new URL(".", OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(events, null, 2) + "\n");
console.log(`fetch-events: wrote ${events.length} upcoming Live events (skipped ${past} past)`);
