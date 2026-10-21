# newtonova.org

A free directory of Northern Virginia groups that welcome new people: creative communities, sports and movement, activist groups, mutual aid, social groups. Visitors browse groups, sign up for a monthly events email, and organizers verify their own listing.

## How I work

- I build in 45-minute weekday morning blocks, sometimes a 2-hour weekend block. Size work to fit one block and say when something won't.
- Propose the approach before writing code, then wait for my yes.
- At the end of a block, write a few lines on what got done as a draft for me to correct, and note where the next block should pick up.
- Zero cost beyond the domain. If something would cost money, name the cost before suggesting it.

## Stack (decided)

- **Astro**, fully static. Search and filtering run in the browser; no server.
- **Data: a Notion database, "newtonova Orgs".** Read at build time with Notion's official JS SDK (`@notionhq/client`), written to a JSON file the pages import. Don't use a community Astro-Notion loader.
  - Database ID: `7261965ae9c947d68bfc57dd9fdb7a82`
  - Data source ID: `db1b67aa-be6e-453c-9481-4e2c9549f87a` (newer Notion API versions query data sources rather than databases; check the current SDK docs for which to use)
  - Only rows with **Status = Live** are published.
  - Token in `NOTION_TOKEN`, from an integration shared with this one database only. Never commit it: `.env` locally, an environment variable on the host.
- **Hosting: Cloudflare Workers** (static assets), deployed from GitHub via Workers Builds on every push to `main`. Free tier. Project name `newtonova`, live at https://newtonova.rebeccadportman.workers.dev/. No wrangler config in the repo; Cloudflare detected Astro on its own.
- **Domain:** newtonova.org is registered at **GoDaddy**. Plan: add the site to Cloudflare and change the nameservers at GoDaddy.
- **Rebuilds:** nightly, so Notion edits show up by morning. Deploy hooks are a Pages feature, so check how to trigger a Workers Builds rebuild on a schedule (e.g. a free GitHub Action) before building this.
- **Organizer form: Tally, "Your group on newtonova"** at https://tally.so/r/RWK9Pd (stored once as `TALLY_URL` in `src/copy.ts`).
  - Hidden fields `org` and `org_id`, prefilled from URL query params. Each listing's "Is this your group?" link passes the org's name and Notion page ID; the organizers box, footer and About page link to the form with no params.
  - Three paths: **claim or update**, **suggest** a group, **remove** a listing.
  - A claim with no edits is still a submission; I check the person and tick Verified. A suggestion from someone who says they organize the group counts as a claim too.
  - Submissions are reviewed by hand and copied into Notion. Contact details stay in Tally. Tally's Notion integration stays **off**.
- **Email signup: Kit** (free plan), on its own page at `/join` (`src/pages/join.astro`), using Kit's JavaScript embed (form `Mills form`, uid `9437739b4a`). The form asks for email plus two optional free-text questions saved as Kit custom fields: what they're looking for, and how they heard about the site. Answers stay in Kit, never in this repo or Notion. The homepage signup box is a pitch with a button to `/join`. Questions will become dropdowns once patterns show up in the answers. Page copy is in `copy.join` in `src/copy.ts`; the questions' wording is set in Kit.

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

Category options: Creative, Sports & movement, Activism, Mutual aid, Learning, Social, Kids, Religious, Volunteering.
Area options: Arlington, Chantilly, Fairfax, Falls Church, Manassas, Reston, Statewide, National.

## Design: homepage layout "C1"

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
| Kids, Religious, Volunteering | pick three more in the same soft range, distinguishable by lightness as well as hue |

**Page, top to bottom** (max width 1200px, 24px side padding):

1. **Header:** logo "new to *nova*" (Instrument Serif 30px, "nova" in italic) on the left. Nav on the right: "Stay in the loop" (links to `/join`), "About". (No organizers link in the nav; organizers are pointed to the form from the About page's "How the list works" section, anchor `/about/#organizers`.) 1px rule underneath.
2. **Hero, two columns** that stack on a phone:
   - Left, wider: H1 in Instrument Serif 64px, line-height 1.02, "Groups in Northern Virginia that *welcome new people.*" (second half italic). Below it, a search field: label "Search the list", 56px tall, 1.5px ink border, 12px radius, magnifier icon, placeholder "Try pottery, hiking, Reston".
   - Right: **signup box**, panel background, 16px radius, 28px padding. H2 and one line from `copy.signup` (Instrument Serif 30px heading), then a full-width ink button that links to `/join`. No form on the homepage.
3. **Filter row:** category chips on the left, Area dropdown on the right.
   - Chips are 44px tall, fully rounded, 14px text, 14px side padding, 8px apart. "All" is white with a light grey border. Each category chip is filled with its pill color. The active chip gets an ink border. Only categories with at least one Live group get a chip. No counts on chips (they'd push the row to two lines).
   - Area dropdown: a native `<select>` with a visible muted "Area" label, 44px tall, fully rounded, light grey border. Options are "All areas" plus each area with at least one Live group, with a count, e.g. "Reston (5)". **Statewide and National groups also show under every town**, and town counts include them. Area order lives in `src/areas.ts`.
   - On a phone, the dropdown drops below the chips at full width.
   - Area, category and search all combine (AND).
   - A Gallery / Map toggle comes later with the map; there is no toggle now.
4. **Group count line:** small muted text (14px) between the filters and the cards. "18 groups" with no filters, "Showing 5 of 18 groups" when any filter or search is active. It's a `role="status"` region so screen readers hear it change.
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

## Later (not now)

- **Map view:** Leaflet with OpenStreetMap tiles. People enter a ZIP (looked up from a static ZIP-to-coordinates table shipped with the site) or use "Use my location", so no address leaves the browser and there's no geocoding API. The address in Notion's **Where** field gets turned into coordinates at build time, with results cached. Orgs marked **No fixed place** stay in the list with no pin. Check OpenStreetMap's tile usage policy before launch.
- Events newsletter content, Verified badge, org pages.
