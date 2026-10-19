// Reads Live rows from the "newtonova Orgs" Notion data source and writes
// src/data/orgs.json for the site. Runs before every build (npm "prebuild").
// Only fields the site shows are written, plus the page id for the Tally form
// link: never Found via, Where, or contact info.

import { writeFileSync, mkdirSync } from "node:fs";
import { Client, collectPaginatedAPI, isFullPage } from "@notionhq/client";

const DATA_SOURCE_ID = "db1b67aa-be6e-453c-9481-4e2c9549f87a";
const OUT = new URL("../src/data/orgs.json", import.meta.url);

if (!process.env.NOTION_TOKEN) {
  console.error("fetch-orgs: NOTION_TOKEN is not set. Add it to .env (local) or the Cloudflare build variables.");
  process.exit(1);
}

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const text = (prop) => (prop?.rich_text ?? prop?.title ?? []).map((t) => t.plain_text).join("").trim();
const names = (prop) => (prop?.multi_select ?? []).map((o) => o.name);

const rows = await collectPaginatedAPI(notion.dataSources.query, {
  data_source_id: DATA_SOURCE_ID,
  filter: { property: "Status", select: { equals: "Live" } },
});

const orgs = rows
  .filter(isFullPage)
  .map((page) => {
    const p = page.properties;
    return {
      id: page.id,
      name: text(p.Name),
      website: p.Website?.url ?? "",
      category: names(p.Category),
      area: names(p.Area),
      blurb: text(p.Blurb),
      status: "Live",
      verified: p.Verified?.checkbox ?? false,
    };
  })
  .filter((o) => {
    if (!o.name) console.warn("fetch-orgs: skipping a Live row with no Name");
    return o.name;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

for (const o of orgs) {
  if (!o.website) console.warn(`fetch-orgs: "${o.name}" has no Website`);
  if (!o.blurb) console.warn(`fetch-orgs: "${o.name}" has no Blurb`);
}

mkdirSync(new URL(".", OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(orgs, null, 2) + "\n");
console.log(`fetch-orgs: wrote ${orgs.length} Live orgs`);
