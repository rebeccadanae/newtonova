# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, served equally. The site works as a matchmaker between them.

- **People looking for community in Northern Virginia**, mostly people who have moved here in the last few years and don't yet know where to find friends, hobbies or causes. They browse on their own time, often on a phone, to find a group they could actually walk into.
- **Groups and small community-minded businesses that welcome new people**, who have no consistent way to reach newcomers. Their job on the site is to check that their listing is right, keep it current, and send events.

## Product Purpose

newtonova.org is a free directory of Northern Virginia groups that welcome new people (creative communities, sports and movement, activism, mutual aid, learning, social, families, religious, volunteering), plus a week-by-week events listing from those groups and a monthly events email.

Success, a year out:
- People who found a group or event here actually show up to it.
- Organizers verify, update and keep their own listings current, and send their events.
- The monthly events email is a real list that people open.

## Positioning

- **No account, no feed.** Free to browse; nothing to sign up for or log in to, no algorithm, no ads. The only ask is an optional email.
- **One place for Northern Virginia.** Groups scattered across Meetup, Facebook, Nextdoor, Eventbrite and their own sites, gathered into one list for this region only.

## Operating Context

- Visitors search, filter by category and area, and click through to each group's own site. The site never hosts sign-ups for groups.
- Events: week and month views, "This weekend", add-to-calendar (Google link, or an .ics download for Apple Calendar and Outlook). Each event links to the group's own page for current details.
- Organizers use one Tally form ("Your group on newtonova") to claim or update a listing, suggest a group, or ask for removal. Becca reviews every submission by hand and copies changes into Notion.
- Email signup is Kit, on its own page (`/join`), with two optional free-text questions (what they're looking for, how they heard about the site).
- Becca works on the site in short blocks (45-minute weekday mornings, sometimes a 2-hour weekend block).

## Capabilities and Constraints

- Fully static Astro site on Cloudflare Workers; search and filters run in the browser. Data comes from two Notion databases at build time; only rows with Status = Live are published.
- **No contact details** for groups or subscribers anywhere in the repo, data or pages. They stay in Tally and Kit. The only exception is hello@newtonova.org on the About page.
- **Blurbs and event write-ups are in Becca's own words.** Never scraped or copied from a group's description. Groups are added by hand from public information, so details can go out of date; the verify flow exists to fix that.
- **Spending is OK when it helps reach more people.** Free is still the default, but a paid tool or plan is fine if it gets the site in front of more newcomers or organizers. No fixed budget yet. Name the cost (and what it buys) before suggesting it.
- Analytics: Umami Cloud, cookieless, so no cookie banner.
- Terminology: "groups" (not organizations or listings, in visitor-facing copy), "Verify your listing", "Is this your group?", "Stay in the loop".
- Undecided / later: a map view (Leaflet + OpenStreetMap, ZIP lookup in the browser), a Verified badge, org pages, the newsletter's content, a nightly rebuild. Sign-up questions become dropdowns once answer patterns show up.

## Brand Commitments

- Name is written **new to nova**, all lowercase, with "nova" in italic where type allows. The domain is newtonova.org.
- Voice is first person singular ("I'll let you know"): one local person, not a company.
- The About page copy is final and in Becca's own words. Other site copy (headline, intro, buttons) is placeholder until Becca rewrites it, and lives in one place (`src/copy.ts`).

## Evidence on Hand

- About page with Becca's story and photo (`src/pages/about.astro`).
- About 40 live groups and a running set of upcoming events, from Notion.
- No testimonials, user counts, subscriber numbers, press or partner logos exist. Do not invent any.

## Product Principles

1. **Getting someone through the door is the goal.** Every page should make it easier to pick a group and go, not to stay on the site.
2. **Be honest about how current things are.** Listings come from public information and can go stale; point to the group's own page for details, and make verifying easy.
3. **Nothing to join.** No accounts, no tracking that needs a banner, no feed. Ask for an email only as an option.
4. **Serve organizers as well as visitors.** A good list depends on groups keeping it current, so their path (claim, update, send events) should be as clear as the visitor's.
5. **Small enough for one person to run.** Prefer what can be maintained by hand in short blocks. Money is better spent on reach than on running costs.

## Accessibility & Inclusion

- Real `<button>`, `<a>`, `<label>` and `<input>` elements; icon-only buttons get an `aria-label`.
- Touch targets at least 44px; body text at least 4.5:1 contrast.
- Below about 700px, everything stacks to one column and the page never scrolls sideways (a row that scrolls inside its own box, like the phone chip row or month grid, is fine).
- Filter results are announced (`role="status"` count).
