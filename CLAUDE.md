# newtonova.org

A free directory of Northern Virginia groups that welcome new people: creative communities, sports and movement, activist groups, mutual aid, social groups. Visitors browse groups, sign up for a monthly events email, and organizers verify their own listing.

## How I work

- I build in 45-minute weekday morning blocks, sometimes a 2-hour weekend block. Size work to fit one block and say when something won't.
- Propose the approach before writing code, then wait for my yes.
- At the end of a block, write a few lines on what got done as a draft for me to correct, and note where the next block should pick up.
- Free by default, but spending is OK when it helps reach more people (no fixed budget yet). If something would cost money, name the cost and what it buys before suggesting it.

## Stack (decided)

- **Astro**, fully static. Search and filtering run in the browser; no server.
- **Data: a Notion database, "newtonova Orgs".** Read at build time with Notion's official JS SDK (`@notionhq/client`), written to a JSON file the pages import. Don't use a community Astro-Notion loader.
  - Database ID: `7261965ae9c947d68bfc57dd9fdb7a82`
  - Data source ID: `db1b67aa-be6e-453c-9481-4e2c9549f87a` (newer Notion API versions query data sources rather than databases; check the current SDK docs for which to use)
  - Only rows with **Status = Live** are published.
- **Events: a second Notion database, "newtonova Events"** (data source `423e16f9-1f99-434c-a8c7-18853486c103`), read by `scripts/fetch-events.mjs` into `src/data/events.json`. Only Status = Live, and past events are dropped at build time and again in the browser. Summary is newsletter-only and never written to the JSON. Each event's categories come from its related org; the event's own Category is used only when it has no Live org. Dates are shown in America/New_York (helpers in `src/event-dates.ts`). What "This weekend" means lives in `src/weekend.ts` (Friday from 5pm through Sunday).
  - Token in `NOTION_TOKEN`, from an integration shared with these two databases only. Never commit it: `.env` locally, an environment variable on the host.
- **Hosting: Cloudflare Workers** (static assets), deployed from GitHub via Workers Builds on every push to `main`. Free tier. Project name `newtonova`, live at https://newtonova.org (also https://newtonova.rebeccadportman.workers.dev/). No wrangler config in the repo; Cloudflare detected Astro on its own.
- **Domain:** newtonova.org is registered at **GoDaddy**, with nameservers pointed at Cloudflare. `newtonova.org` is a custom domain on the Worker. `www` is a proxied placeholder A record (192.0.2.1) plus a Cloudflare Redirect Rule ("Redirect from WWW to root") that sends it to newtonova.org; adding www as a Worker custom domain failed with "No zones match". Cloudflare Email Routing forwards hello@newtonova.org; leave its MX and TXT records alone.
- **Rebuilds:** manual for now (a push or a manual rebuild in Cloudflare). A nightly rebuild is still wanted later; deploy hooks are a Pages feature, so check how to trigger a Workers Builds rebuild on a schedule (e.g. a free GitHub Action) before building it.
- **Organizer form: Tally, "Your group on newtonova"** at https://tally.so/r/RWK9Pd (stored once as `TALLY_URL` in `src/copy.ts`).
  - Hidden fields `org` and `org_id`, prefilled from URL query params. Each listing's "Is this your group?" link passes the org's name and Notion page ID; the organizers box, footer and About page link to the form with no params.
  - Three paths: **claim or update**, **suggest** a group, **remove** a listing.
  - A claim with no edits is still a submission; I check the person and tick Verified. A suggestion from someone who says they organize the group counts as a claim too.
  - Submissions are reviewed by hand and copied into Notion. Contact details stay in Tally. Tally's Notion integration stays **off**.
- **Email signup: Kit** (free plan), on its own page at `/join` (`src/pages/join.astro`), using Kit's JavaScript embed (form `Mills form`, uid `9437739b4a`). The form asks for email plus two optional free-text questions saved as Kit custom fields: what they're looking for, and how they heard about the site. Answers stay in Kit, never in this repo or Notion. The homepage signup box is a pitch with a button to `/join`. Questions will become dropdowns once patterns show up in the answers. Page copy is in `copy.join` in `src/copy.ts`; the questions' wording is set in Kit.

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
| Status | select: Collecting, Ready, Live, Removed | Publish only Live. Removed = the org asked to come down; keep the row so it isn't re-added |
| Verified | checkbox | Not shown yet |
| Found via | url | Never shown (internal) |
| Where | text | Not used until the map |
| No fixed place | checkbox | Not used until the map |

Category options: Creative, Sports & movement, Activism, Mutual aid, Learning, Social, Families, Religious, Volunteering.
Area options: Alexandria, Annandale, Arlington, Ashburn, Centreville, Chantilly, Fairfax, Falls Church, Herndon, Lorton, Manassas, McLean, Reston, Woodbridge, Statewide, National.

## Design: being replaced by the "pinboard" direction (in progress)

Chosen 2026-11-11 after an Impeccable critique and three drafts. Pinned paper flyers on a pale blue fabric board; colour means place (each route group has a colour, set in `src/routes.ts`); "Where are you headed?" picks Inside the Beltway / I-66 West / Dulles Toll Road / I-95 South or a town; "Coming up" pinned sheet; Becca's note (photo + her words) under the headline; Overpass everywhere, sentence case, no all caps. The direction contract lives in `.impeccable/surfaces/src-pages-index-astro.md`; product goals in `PRODUCT.md`.

- Done: homepage (`src/pages/index.astro`, `src/styles/home.css`) and the site-wide font, colours and header.
- Events, part 1 done (block 2, not committed yet): week view as pinned day sheets with route-colour dots, white tags, headline stripe, empty today hidden, month grid starts at this week, count names what it covers. Events styles are in `src/styles/events.css`; shared pinboard pieces (pin, tape, paper buttons, white tags, sheet, headline stripe) moved to `global.css`.
- Events part 2: event rows replaced by place-coloured ticket stubs (chosen 2026-11-11 from three drafts, over a tidy list and a planner page).
- Next: Events month view look and phone pass (filters take most of the first screen), then push, then About and Join (restyle the Kit form), then DESIGN.md, delete `src/pages/drafts/`, and rewrite this section. The C1 notes below describe the old design and only still apply to pages not yet converted.
- Not pushed yet: the homepage commit (728f573) is local only. Push it together with the Events restyle, so the live site isn't half-converted for long.
- Never commit `src/pages/drafts/` (the direction drafts). Astro builds them, so they would go live at `/drafts/...`. Block 3 deletes the folder.
- Optional ideas from Impeccable's finish review, not yet decided: tear-off tabs that look actually torn, pins in varied spots, Becca's handwriting font for small asides, a distinct look for the organizer and signup sheets.
- Screenshots: headless Chrome draws the system font instead of Overpass at phone width. Check phone layouts in the real browser tab instead.

## Old design: homepage layout "C1"

Quiet, white directory. The colored category pills are the only color on the page. No blue.

**Fonts** (Google Fonts): Instrument Serif (headings, logo, org names; regular weight, italic for emphasis) and Instrument Sans (everything else, 400/500/600).

**Colors**

| Token | Hex | Use |
|---|---|---|
| ink | `#1A1A1A` | Text, buttons, active chip border |
| body | `#333333` | Blurb text |
| muted | `#555555` | Labels, location line, footer |
| rule | `#E3E3E3` | Header border, row dividers |
| paper | `#FFFFFF` | Page background |
| panel | `#F5F3EF` | Signup box background |
| panel-border | `#D6D1C7` | Signup input border |
| dashed | `#BDB8AE` | Organizers box dashed border |
| link underline | `#B5B0A6` | Underline color, darkens to ink on hover; links are ink, underline offset 3px |

**Category pill colors** (text is always ink):

| Category | Hex |
|---|---|
| Creative | `#F6D9C9` |
| Sports & movement | `#CFE6D6` |
| Activism | `#D9DDF6` |
| Social | `#F3E3A6` |
| Learning | `#E2DAF2` |
| Mutual aid | `#F5D0DC` |
| Families, Religious, Volunteering | pick three more in the same soft range, distinguishable by lightness as well as hue |

**Page, top to bottom** (max width 1200px, 24px side padding):

1. **Header (all pages, in `src/layouts/Base.astro`):** logo "new to *nova*" (Instrument Serif 30px, "nova" in italic) on the left. On the right: Groups (`/`) · Events (`/events`) · About as plain links, the current page underlined (`aria-current="page"`, set with the layout's `current` prop), then "Stay in the loop" as the one filled ink button (to `/join`). Below 700px it collapses to the logo plus a "Menu" button that opens the links stacked, with the button full width at the bottom. (No organizers link in the nav; organizers are pointed to the form from the About page's "How the list works" section, anchor `/about/#organizers`.) 1px rule underneath.
2. **Hero, two columns** that stack on a phone:
   - Left, wider: H1 in Instrument Serif 64px, line-height 1.02, "Groups in Northern Virginia that *welcome new people.*" (second half italic). Below it, a search field: label "Search the list", 56px tall, 1.5px ink border, 12px radius, magnifier icon, placeholder "Try pottery, hiking, Reston".
   - Right: **signup box**, panel background, 16px radius, 28px padding. H2 and one line from `copy.signup` (Instrument Serif 30px heading), then a full-width ink button that links to `/join`. No form on the homepage. **On a phone the box moves below the cards** (just above the organizers box) so the list comes first; the markup has two copies (`.signup-top`, `.signup-bottom`), one hidden at each size.
3. **Filter row:** category chips across the full width, with the Area dropdown on the count line below (moved there once 10 chips plus the dropdown no longer fit on one line).
   - Chips are 44px tall, fully rounded, 14px text, 14px side padding, 8px apart. "All" is white with a light grey border. Each category chip is filled with its pill color. The active chip gets an ink border. Only categories with at least one Live group get a chip. No counts on chips (they'd push the row to two lines).
   - Area dropdown: a native `<select>` with a visible muted "Area" label, 44px tall, fully rounded, light grey border. Options are "All areas" plus each area with at least one Live group, with a count, e.g. "Reston (5)". **Statewide and National groups also show under every town**, and town counts include them. Area order lives in `src/areas.ts`.
   - On a phone, the chips are one row that swipes sideways (running to the screen edge, with a fade on the right), and the dropdown sits below them at full width, with the count line under it. The Events page chips still wrap.
   - Area, category and search all combine (AND).
   - A Gallery / Map toggle comes later with the map; there is no toggle now.
4. **Group count line:** small muted text (14px) between the chips and the cards, with the Area dropdown at its right end. "18 groups" with no filters, "Showing 5 of 18 groups" when any filter or search is active. It's a `role="status"` region so screen readers hear it change.
5. **Gallery of cards** (replaced the earlier listing rows): a grid, 3 across on desktop, 2 at 1000px and below, 1 on a phone, 16px gaps. Each card is white with a 1px rule border, 14px radius, no shadow. Top to bottom:
   - Category pill(s) (13px, 600 weight, small and rounded)
   - Org name (Instrument Serif 24px, linked to its site)
   - The full blurb (15px, line-height 1.6), not truncated, since there are no org pages yet
   - Map-pin icon with the area in muted text, on its own line
   - "Visit website" (600 weight) and "Is this your group?" (muted, links to Tally with the org prefilled), pinned to the bottom of the card so links line up across a row
   - Don't put the pill and the area side by side. They read as one thing when they're next to each other.
6. **Organizers box:** dashed border, 14px radius. Left: "Run one of these groups?" (Instrument Serif 28px) with the line "Verify your listing to fix the details and show it's current. Free." Right: an outlined ink button "Verify your listing", which goes to Tally.
7. **Footer:** "newtonova.org" on the left, "Suggest a group" on the right, muted 14px, rule above.

**Accessibility:** use real `<button>`, `<a>`, `<label>` and `<input>` elements. Every touch target should be at least 44px, and body text should meet 4.5:1 contrast. Icon-only buttons get an `aria-label`. Below about 700px wide, everything stacks to one column and nothing scrolls sideways.

## /events page

`src/pages/events.astro`; copy in `copy.events`. Everything after the build is client-side, from the event list embedded in the page as JSON.

- Heading, subline, then controls: Week | Month segmented toggle (Week is the default), "This weekend" pill toggle (switches to week view), Area select (areas with upcoming events; Statewide and National show under every town, as on Groups), category chips (same chips and tints as Groups), a count and a "Show all events" button when any filter is on.
- **Week view:** Monday to Sunday, prev/next arrows (no paging before this week, or past the week of the last event), days already past hidden. Title "This week, 11 to 15 November" / "Next week, …" / a plain date range. Day headings with a "Today" badge; empty days say "Nothing listed yet."; a filter with no matches that week shows the warm grey panel instead. Multi-day events show on each day they cover.
- **Event stubs** (in the pinboard look): each day is a pinned sheet holding a grid of ticket stubs, one per event, filled with its place colour (`placeColor` from `src/routes.ts`), slightly tilted. Top to bottom: time ("6pm", "All day", "Continues"), name (its link covers the whole stub), then town in bold · org (org links to its card on Groups, `/#org-<page id>`; no org: Where). "Add to calendar" is an icon button in the stub's top corner. No category line. One stub per row on phones.
- **Month view:** Mon–Sun grid with hairline borders, days outside the month and past days muted, today's number in a black circle. Up to 2 tinted chips per day ("6pm Open Studio", Name truncated with an ellipsis), then "+N more". Clicking a day (today or later) opens week view for that week, scrolled to the day. On phones the grid scrolls sideways inside its box.
- **Add to calendar** (`src/calendar.ts`): a menu with Google Calendar (a link made in the browser) and Apple Calendar / Outlook, which download a .ics file built at build time by `src/pages/events/[id].ics.ts` (served at `/events/<page id>.ics`). Location is Where, else Area; details are just the Link. No end time means start + 2 hours; all-day events become all-day entries.
- Dashed organizer callout at the bottom, same Tally link.

## Later (not now)

- **Map view:** Leaflet with OpenStreetMap tiles. People enter a ZIP (looked up from a static ZIP-to-coordinates table shipped with the site) or use "Use my location", so no address leaves the browser and there's no geocoding API. The address in Notion's **Where** field gets turned into coordinates at build time, with results cached. Orgs marked **No fixed place** stay in the list with no pin. Check OpenStreetMap's tile usage policy before launch.
- Events newsletter content, Verified badge, org pages.
