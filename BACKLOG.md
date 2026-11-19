# Backlog

## Now
- Phase 2 of the move off Notion: blocks 1 to 4b are done (server setup, Access lock, group forms, event forms, repeating events), and the `staging` Worker and database are set up.
- Organizer flow (replaces Tally) designed and approved 2026-11-18: spec `docs/superpowers/specs/2026-11-18-organizer-flow-design.md`, plan `docs/superpowers/plans/2026-11-18-organizer-flow.md`. It comes before phase 2 block 5. Block 1 done 2026-11-18 (Vitest, organizer tables on local and staging, rules rewritten; committed on `main`, not pushed). Block 2 done 2026-11-18 (organizer logic, shared Flyer component, `/yours/<code>` check and thanks pages; checked locally with `astro-dev-nofetch`). Block 3 done 2026-11-18 (Fix something and Take us off). Block 4 done 2026-11-18 (the "help me help" step; the organizer side of the flow is complete). Block 5 done 2026-11-18 (To review queue in /admin; fit in one block). Block 6 done 2026-11-18 (Copy invite, Organizers box, /admin/answers). Staging checked 2026-11-18 (`staging` fast-forwarded to `main` at 13091ce; `/yours` flow works there end to end; test rows removed). Live on newtonova.org 2026-11-18 (0003 applied to the real database; `main` and `staging` at 97f67bf). Becca can send the first invites from `/admin` (Copy invite on a Live group). Tally still live until block 7. Block 7 built 2026-11-19 on `staging`, committed, not pushed (public `/yours/` page: search, claim, add a group, Turnstile; checked locally with Turnstile's test keys). Next block: create the Turnstile widget in Cloudflare (hostnames newtonova.org and newtonova-staging.rebeccadportman.workers.dev), put its site key in `wrangler.jsonc` and its secret with `wrangler secret put TURNSTILE_SECRET` (and `--env staging`), push `staging`, check `/yours/` there, then block 8 (plan task 10: design pass, retire Tally). Before the next push: merge `main` into `staging`, push `staging`, check, then push `main`. Apply 0003 to the real database (`npm run db:migrate`) only just before merging to `main`.

## Next
- [L] Organizer flow, about 8 blocks (see the plan): personal links that open on the group's own flyer, a help-me-help step, a review queue in /admin, then a public "find or add your group" path, and retiring Tally. First emails can go out after block 6
- [S] Flyer tab on Groups: label "Next" → "Next event" (`copy.listing.nextLabel`), and check the tab still fits at phone width
- [S] Optional organizer block: email Becca on each new organizer submission (Cloudflare Email Routing send, free)
- [L] Phase 2 block 5, the switch off Notion, on `staging` first: pick the publish option (Publish button + nightly rebuild via a Deploy Hook recommended), run one last import, then take the Notion import and `NOTION_TOKEN` out of the build
- [M] Nightly rebuild: a scheduled GitHub Action that POSTs to a Workers Builds Deploy Hook (part of block 5 if the recommended option is picked)
- [L] Phase 3: owner and member accounts with Better Auth on D1 (email code sign-in, Becca as admin), claims, an edit queue Becca approves, and a verification process
- [L] Phase 4: owners add events
- [S] Reset / show-all button beside the result count once area or type filters are applied
- [S] Click a tag or location on a card to apply that filter
- [S] Make most of each card tappable as the link to the group (mobile users expect it)
- [S] "I'm feeling lucky" button that opens a random group
- [S] Desktop hover: a soft shadow that shifts with the cursor, so cards feel physical. Check it against the quiet C1 direction first
- [S] Fix spacing on mobile on signs
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
