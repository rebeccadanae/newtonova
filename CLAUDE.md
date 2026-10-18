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
- **"Verify your listing" form: Tally.** Embed or link. Keep Tally's Notion integration **off**.
- **Monthly email signup: Kit** (free plan). Embed Kit's form.

## Hard rules

- **No contact details anywhere in this repo or in Notion.** Org and subscriber contact info stays in Tally and Kit. Don't add email or phone fields to the data, the JSON or the pages.
- **Blurbs and event write-ups are in my own words.** Never scrape or copy an org's or event's description.
- Copy on the site (headline, intro, button labels) is a placeholder until I rewrite it. Keep it easy to find in one place.

## Notion fields

| Field | Type | Use on the site |
|---|---|---|
| Name | title | Card heading |
| Website | url | "Visit website" link |
| Category | multi-select | Colored pill(s), filter chips |
| Area | multi-select | Location line with pin icon |
| Blurb | text | Card body |
| Status | select: Collecting, Ready, Live | Publish only Live |
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

1. **Header:** logo "new to *nova*" (Instrument Serif 30px, "nova" in italic) on the left. Nav on the right: "Monthly email" (anchors to the signup form), "For organizers". 1px rule underneath.
2. **Hero, two columns** that stack on a phone:
   - Left, wider: H1 in Instrument Serif 64px, line-height 1.02, "Groups in Northern Virginia that *welcome new people.*" (second half italic). Below it, a search field: label "Search the list", 56px tall, 1.5px ink border, 12px radius, magnifier icon, placeholder "Try pottery, hiking, Reston".
   - Right: **signup box**, panel background, 16px radius, 28px padding. H2 "What's on this month" (Instrument Serif 30px). One line: "One email a month with upcoming events from groups on the list." Email field (48px) and a full-width ink button "Sign me up" with white text. This becomes the Kit form.
3. **Filter row:** category chips on the left, List / Map toggle on the right.
   - Chips are 44px tall, fully rounded, 15px. "All" is white with a light grey border. Each category chip is filled with its pill color. The active chip gets an ink border.
   - The toggle is a two-segment control with an ink outline; the active segment is filled ink. **For launch, show List only.** Map comes later.
4. **Listing rows**, separated by 1px rules, 24px vertical padding, two columns that wrap on a phone:
   - Left (about 340px): the category pill (13px, 600 weight, small and rounded) **above** the org name (Instrument Serif 30px, linked to its site).
   - Right: the blurb (16px, line-height 1.6), then one line holding a map-pin icon with the area in muted text, and a "Visit website" link (600 weight).
   - Don't put the pill and the area side by side. They read as one thing when they're next to each other.
5. **Organizers box:** dashed border, 14px radius. Left: "Run one of these groups?" (Instrument Serif 28px) with the line "Verify your listing to fix the details and show it's current. Free." Right: an outlined ink button "Verify your listing", which goes to Tally.
6. **Footer:** "newtonova.org" on the left, "Suggest a group" on the right, muted 14px, rule above.

**Accessibility:** use real `<button>`, `<a>`, `<label>` and `<input>` elements. Every touch target should be at least 44px, and body text should meet 4.5:1 contrast. Icon-only buttons get an `aria-label`. Below about 700px wide, everything stacks to one column and nothing scrolls sideways.

## Later (not now)

- **Map view:** Leaflet with OpenStreetMap tiles. People enter a ZIP (looked up from a static ZIP-to-coordinates table shipped with the site) or use "Use my location", so no address leaves the browser and there's no geocoding API. The address in Notion's **Where** field gets turned into coordinates at build time, with results cached. Orgs marked **No fixed place** stay in the list with no pin. Check OpenStreetMap's tile usage policy before launch.
- Events newsletter content, Verified badge, org pages.
