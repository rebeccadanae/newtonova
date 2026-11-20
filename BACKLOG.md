# Backlog

## Now
- The move off Notion is finished (2026-11-20). Admin edits reach the site through the Publish button in `/admin` (live since 2026-11-20) or the nightly rebuild. The last Notion import ran 2026-11-20, and Notion is out of the build.
- Before it's all done: the "Nightly" Deploy Hook and `NIGHTLY_DEPLOY_HOOK_URL` secret, one test run of the nightly workflow, and `NOTION_TOKEN` removed from both Workers' build settings and `.env`.
- Next big piece: pick from Next (the event scraper, or phase 3 accounts).

## Next
- [S] Flyer tab on Groups: label "Next" → "Next event" (`copy.listing.nextLabel`), and check the tab still fits at phone width
- [L] Phase 3: owner and member accounts with Better Auth on D1 (email code sign-in, Becca as admin), claims, an edit queue Becca approves, and a verification process
- [L] Phase 4: owners add events
- [L] Event scraper: a scheduled job pulls new events from groups' events pages into a review queue in `/admin`; nothing goes Live until Becca approves it
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
- Org pages
- Photos (on hold)
- Kit sign-up questions become dropdowns once patterns show up in the answers
- Design: tear-off tabs that look actually torn, pins in varied spots, Becca's handwriting font for small asides
- If the site reads as too Claude-y: redesign from outside reference points, or build around a Google font (partly done: C1 uses Instrument Serif and Instrument Sans)
- More nuanced types of groups and businesses: classes, individual lessons, volunteer groups
- Icons next to types, and other ways to filter and sort
- A quiz for what you might be interested in
- A/B testing
- Sign up for customized feeds
- A way for people to suggest an organization
- A web clipper that saves straight to newtonova
- Organizer fix form: a flyer that updates live as you type, so editing feels like changing your own paper on the board
