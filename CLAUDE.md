# newtonova.org

A free directory of Northern Virginia groups that welcome new people: creative communities, sports and movement, activist groups, mutual aid, social groups. Visitors browse groups, sign up for a monthly events email, and organizers verify their own listing.

## How I work

- I build in 45-minute weekday morning blocks, sometimes a 2-hour weekend block. Size work to fit one block and say when something won't.
- Propose the approach before writing code, then wait for my yes.
- At the end of a block, write a few lines on what got done as a draft for me to correct, and note where the next block should pick up.
- Free by default, but spending is OK when it helps reach more people (no fixed budget yet). If something would cost money, name the cost and what it buys before suggesting it.

## Stack (decided)

- **Astro** with the Cloudflare adapter (`@astrojs/cloudflare`, set up in `astro.config.mjs`). Public pages are prerendered static files; search and filtering run in the browser. A page or endpoint runs on the server only if it sets `export const prerender = false` and reads D1 through `env.DB` (`import { env } from "cloudflare:workers"`). `/api/health` is the first one: Live counts only. Images are optimised at build time (`imageService: "compile"`), and Astro sessions are off (no KV).
- **How data reaches the pages:** every build (`npm run fetch`, run by `prebuild` and `predev`) first copies Notion into D1 (`scripts/import-from-notion.mjs`), then writes `src/data/orgs.json` and `src/data/events.json` from D1 (`scripts/fetch-from-d1.mjs`). Pages import those two files and nothing else. Becca still edits in Notion until the admin page exists; then the import step comes out of the build.
- **Data: a Notion database, "newtonova Orgs".** Read with Notion's official JS SDK (`@notionhq/client`). Don't use a community Astro-Notion loader.
  - Database ID: `7261965ae9c947d68bfc57dd9fdb7a82`
  - Data source ID: `db1b67aa-be6e-453c-9481-4e2c9549f87a` (newer Notion API versions query data sources rather than databases; check the current SDK docs for which to use)
  - Only rows with **Status = Live** are published.
- **Events: a second Notion database, "newtonova Events"** (data source `423e16f9-1f99-434c-a8c7-18853486c103`), ending up in `src/data/events.json`. Only Status = Live, and past events are dropped at build time and again in the browser. Summary is newsletter-only and never written to the JSON. Each event's categories come from its related org; the event's own Category is used only when it has no Live org. Dates are shown in America/New_York (helpers in `src/event-dates.ts`). What "This weekend" means lives in `src/weekend.ts` (Friday from 5pm through Sunday).
  - Token in `NOTION_TOKEN`, from an integration shared with these two databases only. Never commit it: `.env` locally, an environment variable on the host.
- **Moving off Notion to Cloudflare D1** (started 2026-11-13). The site builds from D1; Notion is still where edits happen, copied in on every build.
  - **D1 access:** locally, wrangler uses `npx wrangler login`. On Cloudflare's build it uses `D1_API_TOKEN` (an account token with D1 Edit only, a build secret; never commit it). It's deliberately not named `CLOUDFLARE_API_TOKEN`, which would clash with the deploy's own token. `scripts/d1.mjs` handles both.
  - Database `newtonova` (id `9708a4bf-d7ae-4321-9c29-8c7619e1c7e2`, region ENAM), free tier. Tables `orgs` and `events` in `db/migrations/0001_init.sql`: every Notion field plus new empty org fields (schedule, cost, accessibility, ages, first_time) not shown yet. Ids are the Notion page ids, so `/#org-<id>`, the Tally prefill and `.ics` links keep working. Category and area are JSON arrays of names.
  - Database settings are in the top-level `wrangler.jsonc` (binding `DB`). New table changes go in a new numbered file in `db/migrations/`, then `npm run db:migrate:local` and `npm run db:migrate`.
  - **Import:** `npm run import` copies every Notion row (all statuses) into D1, matched by page id, so it's safe to rerun after editing Notion; `npm run import:local` does the same to the local copy. It never deletes: rows gone from Notion are only listed. Events with no Name or Date are skipped and listed.
  - Plan: phase 1 = tables, the Notion import, and the build reading from D1 (all done 2026-11-13; pages unchanged). Phase 2 = admin page for Becca, about 5 blocks: (1) server setup, done 2026-11-13; (2) lock `/admin` with Cloudflare Access and a read-only group list, done 2026-11-13; (3) group edit and new forms, done 2026-11-14 (the import now keeps the newer edit); (4a) event list, form and copy, done 2026-11-14; (4b) repeating events as dated copies in a series, done 2026-11-14 (design in `docs/superpowers/specs/2026-11-14-admin-event-forms-design.md`); (5) public pages read D1 live, one last import, then the Notion import and `NOTION_TOKEN` come out of the build. Admin forms are plain HTML, with no delete (set Status to Removed). Phase 3 = owner and member accounts with Better Auth on D1 (email code sign-in, Becca as an admin role; Access stays as the outer lock on `/admin`), claims, an edit queue Becca approves, and a verification process. Open questions for phase 3: what member profiles are for, Google sign-in or not, and rewriting the contact-details rule for account emails. Phase 4 = owners add events. Photos are on hold.
- **Hosting: Cloudflare Workers** (static assets), deployed from GitHub via Workers Builds on every push to `main`. Free tier. Project name `newtonova`, live at https://newtonova.org (also https://newtonova.rebeccadportman.workers.dev/). Worker settings are in the top-level `wrangler.jsonc` (name, compatibility date, D1 binding); the adapter fills in the entrypoint and assets. Secrets go in with `npx wrangler secret put`, never in the file. `worker-configuration.d.ts` is generated by `wrangler types` (run by `npm run dev`) and not committed.
- **Staging: work on the `staging` branch, check, then merge into `main`.** Set up 2026-11-14. A second Worker, `newtonova-staging` (https://newtonova-staging.rebeccadportman.workers.dev/), deploys every push to the `staging` branch. Its build command is `CLOUDFLARE_ENV=staging npm run build`; that picks the `env.staging` section of `wrangler.jsonc` (own name, D1 database `newtonova-staging` id `7c7e820c-45db-467e-a521-8f7240506d75`, empty Access vars so `/admin` refuses everyone) and makes `scripts/d1.mjs` read and write the staging database, never the real one. Staging builds show a yellow "Staging site" bar and a noindex tag (`__STAGING__`, defined in `astro.config.mjs`). Admin can't be checked on staging (no Access there): test admin locally against the local D1 copy. **Table changes:** apply each new migration to staging first (`npx wrangler d1 migrations apply newtonova-staging --remote --env staging`), check, then to the real database (`npm run db:migrate`) just before merging to `main`. The staging database started as a copy of the real one on 2026-11-14 and drifts from it after that; recopy with `wrangler d1 export` if needed (the export lists `events` before `series`, so move `series` first). Preview builds are off on both Workers.
- **Domain:** newtonova.org is registered at **GoDaddy**, with nameservers pointed at Cloudflare. `newtonova.org` is a custom domain on the Worker. `www` is a proxied placeholder A record (192.0.2.1) plus a Cloudflare Redirect Rule ("Redirect from WWW to root") that sends it to newtonova.org; adding www as a Worker custom domain failed with "No zones match". Cloudflare Email Routing forwards hello@newtonova.org; leave its MX and TXT records alone.
- **Rebuilds:** manual for now (a push or a manual rebuild in Cloudflare). A nightly rebuild is still wanted. Workers Builds has Deploy Hooks since April 2026 (a secret URL that starts a build when POSTed), so a scheduled GitHub Action or an admin Publish button can call one.
- **Organizer form: Tally, "Your group on newtonova"** at https://tally.so/r/RWK9Pd (stored once as `TALLY_URL` in `src/copy.ts`).
  - Hidden fields `org` and `org_id`, prefilled from URL query params. Each listing's "Is this your group?" link passes the org's name and Notion page ID; the organizers box, footer and About page link to the form with no params.
  - Three paths: **claim or update**, **suggest** a group, **remove** a listing.
  - A claim with no edits is still a submission; I check the person and tick Verified. A suggestion from someone who says they organize the group counts as a claim too.
  - Submissions are reviewed by hand and copied into Notion. Contact details stay in Tally. Tally's Notion integration stays **off**.
- **Email signup: Kit** (free plan), on its own page at `/join` (`src/pages/join.astro`). The form is our own HTML form posting to Kit form 10076200 ("Mills form", `https://app.kit.com/forms/10076200/subscriptions`), not Kit's JavaScript embed, so it has visible labels and the site's look. Fields: `email_address` (required), `fields[interests]` (what they're looking for) and `fields[source]` (how they heard about the site), both optional free text saved as Kit custom fields. Answers stay in Kit, never in this repo or Notion. After signing up, Kit redirects to `/join/thanks/` (set in the form's settings in Kit). The homepage signup sheet links to `/join`. Questions will become dropdowns once patterns show up in the answers. Labels and page copy are in `copy.join` and `copy.joinThanks` in `src/copy.ts`.

- **Analytics: Umami Cloud** (free Hobby plan), cookieless, so no banner. One script tag in `src/layouts/Base.astro` with `data-domains="newtonova.org"`, so local and workers.dev visits aren't counted.

## Hard rules

- **No contact details anywhere in this repo or in Notion.** Org and subscriber contact info stays in Tally and Kit. Don't add email or phone fields to the data, the JSON or the pages. The one exception is my own public site address, hello@newtonova.org, on the About page.
- **Blurbs and event write-ups are in my own words.** Never scrape or copy an org's or event's description.
- Copy on the site (headline, intro, button labels) is a placeholder until I rewrite it. Keep it easy to find in one place.

## Notion fields

| Field | Type | Use on the site |
|---|---|---|
| (page ID) | Notion page id | Written to orgs.json as `id` for the form link; not shown |
| Name | title | Card heading |
| Website | url | "Visit website" link |
| Category | multi-select | Colored pill(s), filter chips |
| Area | multi-select | Location line with pin icon |
| Blurb | text | Card body |
| Status | select: Collecting, Ready, Live (Removed isn't an option in Notion yet; the D1 table allows it) | Publish only Live. Removed = the org asked to come down; keep the row so it isn't re-added |
| Verified | checkbox | Not shown yet |
| Found via | url | Never shown (internal) |
| Where | text | Not used until the map |
| No fixed place | checkbox | Not used until the map |
| Events page | text | Internal (where to find their events) |

Category options: Creative, Sports & movement, Activism, Mutual aid, Learning, Social, Families, Religious, Volunteering.
Area options: Alexandria, Annandale, Arlington, Ashburn, Centreville, Chantilly, Fairfax, Falls Church, Herndon, Lorton, Manassas, McLean, Reston, Woodbridge, Clifton, Statewide, National.

## Design: the pinboard

Chosen 2026-11-11 after an Impeccable critique and three drafts; every page now uses it. **DESIGN.md** is the design system (colours, type, shadows, components, rules) with a sidecar in `.impeccable/design.json`; read it before changing anything visual. The homepage's direction contract is in `.impeccable/surfaces/src-pages-index-astro.md`; product goals are in `PRODUCT.md`.

In short: paper pinned to a pale blue fabric board; colour means place (route colours in `src/routes.ts`), categories are plain white tags; the routes are real green highway signs; Overpass everywhere, sentence case, no italics, no all caps.

- **Styles:** `src/styles/global.css` (tokens, header, footer, shared pieces: `.pin`, `.tape`, `.ink-btn`, `.paper-btn`, `.kind-tag`, `.sheet`, `.hl` marker stripe), `home.css` (Groups), `events.css` (Events), `pages.css` (About, Join).
- **Header** (`src/layouts/Base.astro`): ink bar, the Virginia mark beside plain "new to nova", Groups · Events · About and a white "Stay in the loop" button; the current page is underlined (`current` prop). Below 700px a Menu button opens the links stacked. No organizers link in the nav; organizers reach the form from About's "How the list works" (`/about/#organizers`), the bottom sheets on Groups and Events, and the footer.
- **Logo and favicon:** Virginia (traced from US Census outlines, tilted 12°) in board blue with a red pin over NoVA. `public/favicon.svg`, `favicon.ico` (16/32/48) and `apple-touch-icon.png` (180); the header inlines the same drawing.
- **Screenshots:** headless Chrome draws the system font instead of Overpass at phone width. Check phone layouts in the real browser tab.
- **Drafts:** direction drafts were deleted on 2026-11-11. If new ones are made, keep them out of git: anything in `src/pages/` is built and would go live.
- Optional ideas, not decided: tear-off tabs that look actually torn, pins in varied spots, Becca's handwriting font for small asides.

## Groups (homepage)

`src/pages/index.astro`, copy in `copy.hero`, `copy.note`, `copy.coming`, `copy.routes`, `copy.listing`. Filters run in the browser.

- **Top:** headline with "new people" on the marker stripe, Becca's note (photo + her words), search ("Search the board"). On the right, the taped **Coming up** sheet: the next four events from Live groups, each with a dot in its event's place colour (falling back to the group's towns), and "All events". On phones it shows the next three stacked, name on one line, no group name.
- **Where are you headed?** Four route signs (Inside the Beltway, I-66 West, Dulles Toll Road, I-95 South). Click a sign's name for the whole route or a town for one town; click again to clear; "All of NoVA" clears. **Statewide and National groups count under every town.** A note explains lilac (statewide, national, or in lots of places). On phones the towns fold behind an arrow.
- **Kind tags:** "Everything" plus each category with a Live group; one row that swipes on phones. Search, place and kind combine (AND). The count reads "40 groups", or "Showing 10 of 40 groups" when filtered (`role="status"`).
- **Flyers:** one per Live group, filled with its place colour, tilted and pinned: name (links to its site), bold place line + kinds, the full blurb, then tear-off tabs: **Next** (its next event, or "Nothing listed yet"), **Visit** their site, **"Yours? Check it"** (Tally with `org` and `org_id` prefilled). Each flyer has id `org-<page id>` so Events can link to it.
- **Bottom:** two pinned sheets, organizers (to Tally) and "Stay in the loop" (to `/join`).

## /events page

`src/pages/events.astro`; copy in `copy.events`. Everything after the build is client-side, from the event list embedded in the page as JSON.

- Heading, subline, then controls: Week | Month segmented toggle (Week is the default), "This weekend" toggle (a white tag; switches to week view), Area select (areas with upcoming events; Statewide and National show under every town, as on Groups), category tags (white, as on Groups), a count under the week title ("17 events this week", "62 events in November 2026") with a "Show all events" button beside it when any filter is on. On phones the category tags are one row that swipes, as on Groups.
- **Week view:** Monday to Sunday, prev/next arrows (no paging before this week, or past the week of the last event), days already past hidden. Title "This week, 11 to 15 November" / "Next week, …" / a plain date range. Day headings with a "Today" badge; empty days say "Nothing listed yet."; a filter with no matches that week shows a white "Nothing matches that yet" sheet instead. Today is hidden when nothing is left on it. Multi-day events show on each day they cover.
- **Event stubs** (in the pinboard look): each day is a pinned sheet holding a grid of ticket stubs, one per event, filled with its place colour (`placeColor` from `src/routes.ts`), slightly tilted. Top to bottom: time ("6pm", "All day", "Continues"), name (its link covers the whole stub), then town in bold · org (org links to its card on Groups, `/#org-<page id>`; no org: Where). "Add to calendar" is an icon button in the stub's top corner. No category line. One stub per row on phones.
- **Month view:** one taped white sheet, Mon–Sun grid with dashed lines; the current month starts at this week. Days outside the month and past days muted, today's number in an ink circle. Up to 2 chips per day in each event's place colour ("6pm Open Studio", Name truncated with an ellipsis), then "+N more". Clicking a day (today or later) opens week view for that week, scrolled to the day. On phones the chips give way to up to 3 place-colour dots per day, so the whole month fits with no sideways scroll.
- **Add to calendar** (`src/calendar.ts`): a menu with Google Calendar (a link made in the browser) and Apple Calendar / Outlook, which download a .ics file built at build time by `src/pages/events/[id].ics.ts` (served at `/events/<page id>.ics`). Location is Where, else Area; details are just the Link. No end time means start + 2 hours; all-day events become all-day entries.
- A pinned organizer sheet at the bottom, same Tally link.

## /admin

Becca only. Server-rendered (`prerender = false`), layout `src/layouts/Admin.astro`, styles `src/styles/admin.css`, copy in `copy.admin`. A working tool on the same fabric and ink: one white sheet, no pins or tilts, no analytics, `noindex`.

- **Two locks.** (1) Cloudflare Access app "newtonova admin" on `newtonova.org/admin`, policy allowing Becca's email, one-time PIN sign-in. (2) `src/middleware.ts` checks Access's signed token (`Cf-Access-Jwt-Assertion`) against `ACCESS_TEAM_DOMAIN` and `ACCESS_AUD` (vars in `wrangler.jsonc`, not secret) on every `/admin` request, so it stays shut on hosts Access doesn't cover (workers.dev). Empty vars or a bad token mean 403. Local `npm run dev` skips the check and shows "local dev".
- **Groups list** (`/admin/`): every group, any status. Search (name, town or kind) and status links with counts that follow the search. Each name opens its edit page; "New group" opens a blank one. After a save the list says "Saved <name>".
- **Group form** (`/admin/groups/<id>`, `/admin/groups/new`; one page, `src/pages/admin/groups/[id].astro`): plain HTML form posting back to itself. Two parts: `src/components/GroupFields.astro` (details an owner could also fill in, meant for the phase 3 owner form) and `AdminGroupFields.astro` (status, verified, found via, events page: never in an owner form). Reading, checking and saving live in `src/admin/groups.ts`. Towns are grouped by route (from `src/routes.ts`) plus Statewide and National. New groups get a `crypto.randomUUID()` id. Saving sets `updated_at`; edits reach the public pages on the next rebuild. Astro's built-in origin check blocks cross-site posts.
- **Events list** (`/admin/events/`): upcoming by default (end or start on or after today, New York time), "Past" for the rest; search on event or group name; status links with counts. Header links switch between Groups and Events (`section` prop on `Admin.astro`).
- **Event form** (`/admin/events/<id>`, `/admin/events/new`; `src/pages/admin/events/[id].astro`, logic in `src/admin/events.ts`): date, optional start time (empty = all day), optional end date and end time; stored as Notion stores them (`"2026-12-05"`, or `"2026-11-15T09:00:00.000-05:00"` with the New York offset for that date). Group is a dropdown of every group, including ones added in admin. New events default to Live. "Copy as new event" goes to `/admin/events/new?from=<id>`, prefilled except the date.
- **Repeating events** (`src/admin/series.ts`, table `series` from `db/migrations/0002_event_series.sql`): a "Repeats" section on new events (every week, every 2 weeks, monthly on the Nth weekday, monthly on the last weekday) plus "Repeat until" (empty = 3 months, at most 12). Saving makes one ordinary event per date, all with the same `series_id`, so the public pages and `.ics` files see plain events. Editing a series event offers "This event only" or "This and later ones" (every field but the date; each keeps its own day). Its page has "Add more dates", which copies the latest date forward. The events list flags series whose last date is within 30 days ("Repeats running out"). To skip one date, set it to Removed; to end a series, set "this and later" to Removed.
- **Edits vs. the Notion import:** until block 5 the import still runs on every build, but it only overwrites a group or event when Notion's copy was edited after D1's `updated_at`, so the newer edit wins. The new group detail fields aren't in Notion and are never touched by the import.

## Later (not now)

- **Map view:** Leaflet with OpenStreetMap tiles. People enter a ZIP (looked up from a static ZIP-to-coordinates table shipped with the site) or use "Use my location", so no address leaves the browser and there's no geocoding API. The address in Notion's **Where** field gets turned into coordinates at build time, with results cached. Orgs marked **No fixed place** stay in the list with no pin. Check OpenStreetMap's tile usage policy before launch.
- Events newsletter content, Verified badge, org pages.
