# Organizer flow: replacing the Tally form

Agreed with Becca on 2026-11-18. Replaces the Tally form "Your group on newtonova".

## Why

The few organizers Becca has asked to fill in the Tally form haven't done it. It's clunky and doesn't feel like it's about *their* group. The new flow should be easy and appealing enough that organizers actually finish it.

It also has a second job. Becca is figuring out whether there's a business in serving these groups (what they struggle with, whether they want to connect with each other, whether they need admin, marketing, space or tech help), and conversations with organizers have been valuable in their own right. The flow is how those conversations start.

Longer term this may grow into a community for local organizers: resources, connecting with each other, in-depth profiles of groups, maybe helping groups without a website get one. None of that is built now, but the data is shaped so it can be.

## Goals

- Becca can email an organizer a personal link that opens on **their own flyer**, already filled in, to react to.
- From there the organizer can, in under two minutes on a phone: confirm it's right, fix something, or ask for it to come down.
- Organizers can write their own blurb.
- A short, optional "help me help groups like yours" step learns what they struggle with and whether they'd talk to Becca or connect with other organizers.
- Organizers Becca hasn't emailed can find their group and claim it, or add a new one, from the site.
- Every submission waits for Becca's OK in `/admin`. Nothing an organizer sends goes live on its own.
- The Tally form is retired.

## Non-goals (for now)

- Accounts and sign-in (phase 3). The personal link stands in for sign-in until then.
- Organizers sending events (phase 4).
- Profiles, connecting organizers with each other, resources, or website help. The answers from this flow decide which comes first.
- The site sending outreach emails. Becca sends each one herself from Gmail.
- Showing any organizer details or answers on the public site.

## Anti-goals

- It feels like a form or a survey. It should feel like Becca showing them their flyer and asking "is this right?"
- A sign-up, password or account step before they can do anything.
- The survey step gets in the way of finishing. It comes after, and every question in it is optional.
- Anything goes live without Becca seeing it.

## Rule changes (decided by Becca, 2026-11-18)

1. **Contact details.** The old rule was: no contact details in the repo, Notion or D1. The new rule:
   - An organizer's own name and email may be stored in D1 so Becca can reply and they can come back later.
   - Those details are never shown on the site, never written to `orgs.json` or `events.json`, and never committed.
   - Subscriber details still stay in Kit.
   - hello@newtonova.org on the About page is still the only email on the site.
2. **Blurbs.**
   - Organizers can write their own blurb, in their own words.
   - When Becca writes one, she paraphrases loosely.
   - Don't copy a group's text from their site without asking.
   - Background: the old "Becca's own words" rule had no recorded reason. Text on a group's website is copyrighted automatically, but text an organizer submits is theirs to give.

Both rules get rewritten in CLAUDE.md and PRODUCT.md, and in the comment at the top of `db/migrations/0001_init.sql`'s successor migration.

## Approaches considered

1. **Build it into the site on D1 (chosen).** Each group gets a secret link, server pages show the real flyer, and submissions go to a review list in `/admin`. It shows organizers their actual listing, needs no retyping by Becca, costs nothing, and leaves a base for accounts and the community later. It's the most work: about 8 blocks, with the first emails possible after about 6.
2. **A nicer form tool** (Fillout, Typeform or a rebuilt Tally) with a prefilled link per group. About 1–2 blocks, but it still feels like a form, can't show the flyer as it really looks, and Becca still retypes everything. That's what already failed.
3. **Go straight to phase 3 accounts** (sign in with an emailed code). It adds a sign-in step, which is the friction we're removing, and it takes more blocks. Option 1 grows into this later without rework (see "Path to accounts").

## Design

### The outreach email (sent by Becca, by hand)

It's modelled loosely on the "Website Launches" claim email Becca received: it shows the listing in a box, has one button, says in one line what checking gets them, offers "just reply", and puts the removal option quietly at the bottom. Unlike that email, it's written in Becca's first person (no "was detected", no "Unclaimed"). Draft:

```
Subject: <Group> is on new to nova

Hi <first name>,

I'm Becca. I run new to nova, a free list of Northern Virginia
groups that welcome new people. I added <Group> because <one line>.

  <Group>
  <Towns> · <Kinds>
  "<first ~120 characters of the blurb>…"

  Check your listing: <personal link>   (takes 2 minutes)

You can fix anything that's off and tell me what would help your
group. It's free, and always will be.

Not something you want? You can take it off the list from the same
link. Or just reply. I read everything.
```

The draft lives in `copy.ts` (placeholder until Becca rewrites it). It's plain text, so it pastes cleanly into Gmail.

### Personal links

- Each group can have one active invite code. The code is a random 128-bit value, base64url, in the URL `/yours/<code>`.
- Codes don't expire. Becca can revoke a code or make a new one in `/admin` (making a new one revokes the old one).
- Holding the link only lets someone *suggest* changes. Everything waits for Becca, so a forwarded link is harmless. **Builder's call:** store the code in plain text so "Copy invite" can be clicked again later. Hashing isn't worth losing that, given what the code can do.
- A revoked or unknown code shows a friendly page that points to the public path ("Find your group").
- Invites are for **Live groups only** (Becca, 2026-11-18). "Copy invite" appears only on Live groups. If a group stops being Live after its link went out, the link shows "This group isn't on the list right now. Just reply to my email if you have questions." The public search also covers Live groups only.

### The organizer pages (`/yours/…`, server-rendered)

The pages use the pinboard look (DESIGN.md) and are built phone-first. Copy is in a new `copy.yours` in `src/copy.ts` (placeholder until Becca rewrites it). The pages are `noindex` and have no analytics on code URLs. **Builder's call:** they still count as public pages, so Umami can stay, but it must not record the code. Simplest is to leave Umami off these pages.

**Step 1: "Is this right?"** shows their flyer exactly as it appears on Groups, rendered from D1's current row, with three choices:

```
Hi! This is how <Group> looks on new to nova.
[ their pinned flyer ]
Is this right?
( Looks good )  ( Fix something )
         Take us off the list
```

- **Looks good** creates a `confirm` submission and goes to step 3.
- **Fix something** goes to step 2a.
- **Take us off the list** goes to step 2b.

**Step 2a: Fix something.**
- The group detail fields come prefilled, using the existing `GroupFields.astro` (name, website, blurb, kinds, towns, schedule, cost, accessibility, ages, first time, where, no fixed place).
- The blurb field has a prompt aimed at newcomers: "What would someone new want to know before showing up?"
- A free "Anything else I should know?" note.
- Saving creates a `change` submission holding the full proposed group, then goes to step 3.
- Validation reuses `readDetails` from `src/admin/groups.ts`.

**Step 2b: Take us off.** One optional line ("Mind telling me why?"). Saving creates a `remove` submission, then goes to step 3.

**Mockups:** https://claude.ai/artifact/E2TEX4227MFkLJam7beiyH, revised after an Impeccable critique on 2026-11-18.

The revision set these rules:

- **Decision first.** "Looks good" is a single tap.
- **Who's sending is a single line.** Under the send button: "Sending as Sam. Not Sam?" The fields below appear only when that's tapped, or when the invite has no name.
- **Progress line.** Every organizer screen starts with a progress line: "Your flyer · A few questions · Done", as an `<ol>` with `aria-current="step"`. "Is this right?" and "Fix something" are both step 1, and "Help me help" is step 2. "Fix something" stays one page rather than a wizard, because most people change only one or two things.
- **"Fix something" stays short.** The five newcomer fields sit behind an "Add details for newcomers" button.
- **Choice controls:**
  - Kinds and towns on "Fix something" each start as a summary line ("Sports & movement, Social") with a **Change** button. Tapping it opens an even two-column grid of tick boxes. Towns are grouped by route, and each keeps its place-colour dot.
  - Long pick-any lists are full-width rows with a drawn tick box.
  - Three-option one-answer questions are a segmented switch like Week | Month.
  - Four-option one-answer questions are rows with round markers.
  - Inputs follow DESIGN.md: 2px border, 50px tall, yellow focus ring.

**Who's sending this.** Every submission needs a person (`submissions.person_id` is never null). **Builder's call.** The "Not Sam?" fields are:

- **Name:** "Your name". Required. Prefilled with the first name Becca entered when making the invite, and editable.
- **Email:**
  - If the invite has an email, the page shows "I'll reply to the address I emailed" with an optional "Use a different email" field. The stored email is never displayed on the page, so a forwarded link doesn't leak it.
  - Otherwise (public path, or an invite made without an email), email is required.
- **Role:** "Your role with the group". Optional free text, for example "organizer" or "owner".

**Step 3: "Help me help groups like yours."** This is one screen, and every question is optional:

| Question | Answer |
|---|---|
| What takes the most of your time or energy? | Pick any: Finding new people · Social media & marketing · Space to meet · Tech: website, sign-ups, payments · Admin & paperwork · Money & funding · Volunteers / help · Something else (short text) |
| If you could hand one thing off, what would it be? | A line or two |
| Would you be up for a 30-minute chat with me? | Yes · Maybe later · No thanks |
| Would you like to connect with other local organizers, online or in person, to swap ideas and share resources? | Yes, online · Yes, in person · Either works · Not right now |
| Could I write a longer profile of your group someday? | Sure · Ask me first · No |

- **Skipping:** a visible "Skip" link. Leaving this screen without answering still keeps the step 1 or step 2 submission.
- **Answer labels** live in `copy.ts`. The stored values are short stable keys (`marketing`, `space`, …) so the wording can change without breaking the counts.

**Step 4: Thanks.** "Thanks, <name>. I'll look at this within a week." If they said yes to a chat: "I'll email you to find a time." There's also a link back to their flyer on Groups.

**Coming back.** If they open the same link again, they see the flyer as it is *now* plus a note: "You sent me changes on <date>. They're waiting for me to look at them." They can send more; a newer pending change from the same code replaces the older one.

### Public path (organizers Becca hasn't emailed)

- One entry point, `/yours/` (a server page; **builder's call** on whether to make it static with a client-side search over `orgs.json`, which is simpler).
- Heading: "Is your group on new to nova?" A search over Live groups, then "Add your group" for a blank flyer.
- **Picking an existing group** runs the same steps as the personal link, without a code. The submission is marked `via: public`, and Becca checks the person by hand before approving, as she does with Tally claims now.
- **Add your group** opens a blank `GroupFields` form, then step 3. It creates a `new` submission.
- **Spam:** Cloudflare Turnstile (free) on the public forms only. Personal-link pages don't need it.
- **Links that change:**
  - Each flyer's "Yours? Check it" tab goes to `/yours/?org=<id>`, skipping the search.
  - The Groups and Events organizer sheets, the footer and About's "How the list works" link go to `/yours/`.
  - `TALLY_URL` is removed once nothing uses it.

### Becca's side (`/admin`)

**To review** (`/admin/review/`): a third header link beside Groups and Events, showing the count of pending items. Newest first. Each row shows group name, kind of submission (Looks good / Changes / Take off / New group), who sent it, via (link / public), and date.

**Reviewing one:**
- **confirm:** shows the flyer and the person. **Approve** sets `verified = 1`.
- **change:** opens the normal group edit form *prefilled with the proposed values*. Fields that differ from the current row are marked, with the current value shown underneath. Becca can adjust before saving. **Approve and save** writes the org (setting `updated_at`) and also sets `verified = 1`. **Decline** keeps the org as it is.
- **remove:** shows the reason. **Approve** sets Status to Removed.
- **new:** opens the new group form prefilled. **Approve and save** creates the org. **Builder's call:** default Status to Ready, so Becca picks when it goes Live. It's also linked to the person and marked verified.
- Approving or declining sets the submission's status and `decided_at`. Declined items stay in the table but drop off the list.
- Approved changes reach the public pages at the next rebuild, as with any `/admin` edit.

**On each group's edit page:**
- An **Organizers** box lists linked people (name, email, role, the date they last sent something).
- **Copy invite** asks for the organizer's first name and email (both optional, saved as a person linked to the group), makes or reuses the group's code, and copies the drafted email (above) to the clipboard. There are also **Copy link only** and **Revoke link** buttons.
- **Their answers** shows the latest step 3 answers for this group.

**What organizers need** (`/admin/answers/`): counts for each multiple-choice answer across all groups (for example "Social media & marketing: 12 of 20"), then every "hand one thing off" answer as a list with the group name. Two filtered lists: "Said yes to a chat" and "Wants to connect", each with name, email and group, so Becca can follow up.

**Knowing something came in.** For the first version, Becca checks the To review count. An email to Becca on each new submission is a later, optional block in the plan. Cloudflare Email Routing can send to a verified destination address from a Worker for free.

### Data (new migration `db/migrations/0003_organizers.sql`)

The table names are chosen so Better Auth's own `user` table can link in later with one column.

```
people        id, name, email, created_at, updated_at
              -- one row per organizer; email unique (case-insensitive)
org_people    org_id → orgs, person_id → people, role, trusted (0/1, unused for now),
              created_at   -- primary key (org_id, person_id)
invites       code (pk), org_id → orgs, person_id → people (nullable),
              created_at, revoked_at
submissions   id, kind ('confirm'|'change'|'remove'|'new'), org_id (null for new),
              person_id, via ('invite'|'public'), invite_code (nullable),
              proposed (JSON of group fields, for change/new), note,
              status ('pending'|'approved'|'declined'), created_at, decided_at
org_answers   id, org_id (nullable for new until approved), person_id,
              submission_id, struggles (JSON array of keys), struggle_other,
              hand_off, chat ('yes'|'maybe'|'no'), connect ('online'|'in_person'|
              'either'|'no'), profile ('yes'|'ask'|'no'), created_at
```

- A `new` submission's answers get `org_id` filled in when Becca approves it.
- A person is matched by email. A second submission from the same email reuses the row and updates the name if it changed.
- The comment at the top of the migration states the new contact rule.
- The import from Notion and `fetch-from-d1.mjs` never read these tables. `fetch-from-d1.mjs` keeps writing only public org and event fields. Add a test or assertion that `orgs.json` has no `email` key.

### Path to accounts (phase 3)

1. Add Better Auth with sign-in by emailed code. Add `people.user_id`. On first sign-in, the email matches the existing `people` row, so the organizer sees their groups right away with no re-claiming.
2. The `/yours/…` pages and the review queue stay. Only the way in changes: Becca's next email says "Sign in to check your listing", and old codes can be revoked.
3. `org_people.trusted` later lets chosen organizers' changes go live without review.
4. Still open: Google sign-in, what member profiles are for, and whether visitors ever get accounts. "Nothing to join" stays a principle for visitors.

## Constraints

- **Stack:** Astro on Cloudflare Workers with D1. Server pages use `prerender = false` and `env.DB`. Forms are plain HTML POSTs with no client framework, as in `/admin`. Astro's origin check stays on.
- **`/yours/` is public:** the middleware's Access check stays limited to `/admin`. `/yours/` responses are `cache-control: no-store` and `noindex`.
- **Staging:** organizer pages can be tested on staging, but `/admin` can't (no Access there), so review screens are tested locally against the local D1. Migrations go to staging first, then the real database just before merging (CLAUDE.md).
- **Design:** pinboard look, Overpass, sentence case, real controls, touch targets of at least 44px, one column below 700px. The Impeccable design hook is on, so use it for the pages' design pass.
- **Blocks:** 45 minutes each. Each block ends with something working on `staging` (organizer pages) or locally (admin).

## Left to the builder

- Exact layout within the pinboard system, and error display (inline under fields, as in `/admin`).
- Whether the flyer markup is pulled out of `index.astro` into a shared component (likely needed so `/yours/` shows the identical flyer) or duplicated.
- URL shapes for the steps (one page with a `step` param, or separate paths), as long as each step works with the back button and on a phone.
- How "fields that differ" are marked on the review form.
- Rate limiting beyond Turnstile, if any looks needed.
