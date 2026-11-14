# Backlog

## Now
- Phase 2 of the move off Notion: blocks 1 to 4b are done (server setup, Access lock, group forms, event forms, repeating events), and the `staging` Worker and database are set up. CLAUDE.md is up to date and the tree is clean. Next is block 5, starting by picking how edits reach the public pages.

## Next
- [L] Phase 2 block 5, the switch off Notion, on `staging` first: pick the publish option (Publish button + nightly rebuild via a Deploy Hook recommended), run one last import, then take the Notion import and `NOTION_TOKEN` out of the build
- [M] Nightly rebuild: a scheduled GitHub Action that POSTs to a Workers Builds Deploy Hook (part of block 5 if the recommended option is picked)
- [L] Phase 3: owner and member accounts with Better Auth on D1 (email code sign-in, Becca as admin), claims, an edit queue Becca approves, and a verification process
- [L] Phase 4: owners add events

## Someday
- Phase 3 open questions: what member profiles are for, Google sign-in or not, rewriting the contact-details rule for account emails
- Map view: Leaflet + OpenStreetMap, ZIP lookup or "Use my location" in the browser, Where geocoded at build time and cached, No fixed place groups get no pin; check OSM's tile policy first
- Events newsletter content
- Verified badge
- Org pages
- Photos (on hold)
- Kit sign-up questions become dropdowns once patterns show up in the answers
- Design: tear-off tabs that look actually torn, pins in varied spots, Becca's handwriting font for small asides
