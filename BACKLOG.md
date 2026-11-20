# Backlog

## Now
- The move off Notion is finished (2026-11-20). Admin edits reach the site through the Publish button in `/admin` (live since 2026-11-20) or the nightly rebuild. The last Notion import ran 2026-11-20, and Notion is out of the build.
- Checked 2026-11-20: Publish on newtonova.org starts a newtonova build, the nightly workflow's test run started one too (it runs at 09:00 UTC), and `NOTION_TOKEN` is gone from both Workers and `.env`. `main` and `staging` are at 4c86a34; this backlog update is committed on `staging` only and goes up with the next push.
- Next big piece: pick from Next (the event scraper, or phase 3 accounts).

## Next
- [S] Flyer tab on Groups: label "Next" → "Next event" (`copy.listing.nextLabel`), and check the tab still fits at phone width
- [L] Phase 3: owner and member accounts with Better Auth on D1 (email code sign-in, Becca as admin), claims, an edit queue Becca approves, and a verification process
- [L] Phase 4: owners add events
- [L] Event scraper: a scheduled job pulls new events from groups' events pages into a review queue in `/admin`; nothing goes Live until Becca approves it
- [M] Group details page: one page per group showing what the group form now collects (schedule, cost, accessibility, ages, first time, where), linked from its flyer. Soon, since organizers are already filling these in
- [M] Design pass on the organizer form (`/yours/`), beyond what 8b did
- [S] Reset / show-all button beside the result count once area or type filters are applied
- [S] Click a tag or location on a card to apply that filter
- [S] Make most of each card tappable as the link to the group (mobile users expect it)
- [S] "I'm feeling lucky" button that opens a random group
- [S] Desktop hover: a soft shadow that shifts with the cursor, so cards feel physical. Check it against the quiet C1 direction first
- [S] Fix spacing on mobile on signs
- [S] A subdomain for the staging site (the `staging` Worker), so it has a stable address
- [M] Go through the copy everywhere
- [S] Organizer flow: add an "Other" option
- [S] Organizer flow: split Creative into Arts & Crafts and Performing Arts
- [S] Organizer flow: rewrite the copy on the One more thing page
- [M] Move the search bar down and make it actually work
- [S] More text for search
- [M] Try design tools on the site: Impeccable (https://impeccable.style/) and the design-for-ai Claude Code plugin (https://github.com/ryanthedev/design-for-ai)

## Someday
- Organizer community, picked by what the help-me-help answers show: in-depth group profiles, connecting organizers (online or in person), resources for small groups and businesses, help for groups without a website
- Phase 3 open questions: what member profiles are for, Google sign-in or not, rewriting the contact-details rule for account emails
- Map view: Leaflet + OpenStreetMap, ZIP lookup or "Use my location" in the browser, Where geocoded at build time and cached, No fixed place groups get no pin; check OSM's tile policy first
- Events newsletter content
- Verified badge
- Photos on group listings and details pages (on hold, but wanted eventually)
- Kit sign-up questions become dropdowns once patterns show up in the answers
- Design: tear-off tabs that look actually torn, pins in varied spots, Becca's handwriting font for small asides
- If the site reads as too Claude-y: redesign from outside reference points, or build around a Google font (partly done: C1 uses Instrument Serif and Instrument Sans)
- Broader kinds of listings, since not everything saved is a group: businesses that offer space, online resources (Facebook groups, newsletters), classes and individual lessons, volunteer groups. Needs a sturdier way to mark and filter what kind of thing each listing is
- Icons next to types, and other ways to filter and sort
- A quiz for what you might be interested in
- A/B testing
- Community members sign up for updates and say what they're interested in (after organizer accounts in phase 3), leading to customized feeds
- A way for people to suggest an organization
- A web clipper that saves events and groups straight to D1 as drafts (not Live) for later processing, next to the event scraper's review queue
- Organizer fix form: a flyer that updates live as you type, so editing feels like changing your own paper on the board
- Built-in AI to help draft descriptions (blurbs), in admin and maybe the organizer form. Costs money per use (an AI API), so price it first
- Member community on top of accounts: find a buddy to try a new group with, and members leave testimonials about groups they've joined
