---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# Homepage (Groups)

Scope: the Groups homepage, `src/pages/index.astro`, first surface of a replacement visual world that later carries to Events, About and Join. Mode: Operate (browse, filter, pick a group), with a Persuade first impression.

Audience and job: newcomers to Northern Virginia, often on a phone, deciding which group they could walk into; organizers checking their own listing. Action: find a group near you and go (their site, next event); organizers: "Check your listing" (Tally).

Proof and content: ~40 Live groups from Notion, upcoming events from Notion (next event per group, "Coming up"), Becca's photo and her own words. "I've been" marks only once a real Notion field exists; until then, none ship.

Constraints: PRODUCT.md (no contact details, blurbs in Becca's words, first-person voice, 44px targets, 4.5:1 contrast, no sideways page scroll). Static Astro; filters run in the browser.

Memorable moment: pinned flyers you can tear a tab off; picking where you're headed by route.

Reference draft: `src/pages/drafts/combined.astro` (font=overpass, note=quiet), approved by Becca 2026-11-11.

## Direction contract

THESIS: A local community pinboard, not a directory template. Groups are paper flyers pinned to a blue fabric board, colored by where they are, and you choose where by the roads people actually use. Refuses the white card grid with pastel category pills and the italic-serif hero.

OWN-WORLD: Pale blue woven-fabric ground (#CFE2EA), ink #1D2A2F shell bar, white paper sheets with soft downward shadows and colored pushpins, slight tilts. Route colors carry place everywhere: coral Inside the Beltway, yellow I-66 West, green Dulles Toll Road, pink I-95 South, lilac Anywhere. Category is plain white tags. Overpass throughout, sentence case, no all caps; a pen hand only for small asides. Real interstate and Virginia route shields.

STORY: A newcomer sees Becca's face and words, searches or picks a route, scans flyers colored by place, sees each group's next date, and tears off a tab to go. An organizer spots "Yours? Check it" and the pinned sheet asking them to check their listing.

FIRST VIEWPORT: Desktop: left 60%: headline in Overpass 800, Becca's quiet note (84px round photo, plain text), search. Right: "Coming up" taped white sheet with four next events, each with a route-color dot. "Where are you headed?" begins just below. Phone: headline, note, search, Coming up as the next three stacked (name on one line, group hidden), then four compact route buttons (towns open on tap), then flyers; first flyer within about a screen and a half.

FORM: Fusion pinned by Becca after the roll: board (pinned flyers, tear-off tabs, Coming up) + assigned highway-signs direction (route groups, shields, Overpass) + guide-map palette and photo placement. seed:eee6b5e51f873239 (assigned candidate 5, highway signs, kept as the route-group system).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
