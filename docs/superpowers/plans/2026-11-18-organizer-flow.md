# Organizer Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Tally form with personal links that open on an organizer's own flyer (confirm, fix, or take down), plus a short "help me help groups like yours" step and a review queue in `/admin`.

**Architecture:**
- New server-rendered pages under `/yours/` read and write D1 through `env.DB`.
- Organizer logic lives in `src/organizers/`, review logic in `src/admin/review.ts`.
- Nothing an organizer sends touches `orgs` until Becca approves it in `/admin/review/`.
- The public pages stay static.

**Tech Stack:** Astro 7 + `@astrojs/cloudflare`, D1, plain HTML forms, Vitest (new dev dependency) for pure functions, Cloudflare Turnstile on the public path.

**Spec:** `docs/superpowers/specs/2026-11-18-organizer-flow-design.md`

**Mockups (approved 2026-11-18):** https://claude.ai/artifact/E2TEX4227MFkLJam7beiyH. Build the organizer pages to match them: the progress line, the one-tap "Looks good", the summary pickers with Change, the tick rows, the segmented switch, and the round-marker rows.

**Order:** this runs **before** phase 2 block 5. Until block 5 lands, Becca starts a rebuild in Cloudflare after approving changes.

## Blocks (45 minutes each)

| Block | Tasks | Ends with |
|---|---|---|
| 1 | 1, 2 | Tests run; new tables on local + staging; rules rewritten in CLAUDE.md / PRODUCT.md |
| 2 | 3, 4 | `/yours/<code>` shows the flyer; "Looks good" saves a submission (testable on staging with a code inserted by hand) |
| 3 | 5 | Fix something and Take us off work |
| 4 | 6 | Help-me-help step, thanks page, "coming back" note |
| 5 | 7 | `/admin/review/` list and approve/decline. **May run into a second block**: the change review form is the biggest piece |
| 6 | 8 | Copy invite, organizers box, `/admin/answers/`. **First emails can go out after this block.** |
| 7 | 9 | Public path `/yours/` with search, add a group, Turnstile |
| 8 | 10 | Design pass with Impeccable, Tally retired, merged to `main` |
| optional | 11 | Email to Becca on each new submission |

## Global Constraints

- **Contact rule (new):** an organizer's own name and email may be stored in D1. They are never shown on the site, never in `orgs.json` / `events.json`, and never committed. Subscriber details stay in Kit.
- **Blurb rule (new):** organizers can write their own blurb. When Becca writes one, she paraphrases loosely. Don't copy a group's text without asking.
- Every organizer submission waits for Becca's approval. Nothing goes live on its own.
- Invites and the public search cover **Live groups only**.
- `/yours/` pages are `prerender = false`, `cache-control: no-store`, `x-robots-tag: noindex`, and have no Umami script.
- Pages are plain HTML forms with POST-redirect-GET, and Astro's origin check stays on.
- Copy:
  - All copy is in `src/copy.ts`: `copy.yours` for organizer pages, `copy.admin.review` and `copy.admin.answers` for admin.
  - Sentence case, first person, no italics, no all caps.
- Answer values are stored as these keys:
  - struggles: `new_people`, `marketing`, `space`, `tech`, `admin`, `money`, `volunteers`, `other`
  - chat: `yes`, `maybe`, `no`
  - connect: `online`, `in_person`, `either`, `no`
  - profile: `yes`, `ask`, `no`
- Invite codes are 16 random bytes in base64url (22 characters), stored in plain text.
- Layout: pinboard look (DESIGN.md), touch targets of at least 44px, one column below 700px. Check phone layouts in the real browser tab, because headless Chrome draws the wrong font.
- Migrations: apply to local, then staging (`npx wrangler d1 migrations apply newtonova-staging --remote --env staging`), then the real database (`npm run db:migrate`) just before merging to `main`.
- Work on the `staging` branch. Admin pages are tested locally only, because `/admin` refuses everyone on staging.

## Review Focus

1. **Revoked or unknown code, or a group that's no longer Live.** The link shows the friendly "isn't on the list right now" or "find your group" page, never a form, and never a 500 error.
2. **Double submit or refresh after POST.** It creates one pending submission, not two. A newer pending `change` from the same code replaces the older one.
3. **Email with different case or spaces** (`" Sam@X.com"` vs `"sam@x.com"`). It matches the same `people` row.
4. **Becca edits a group after the organizer submitted.** The review form compares the proposal with the group's *current* row, not the row as it was at submit time.
5. **Contact data leaking.** `orgs.json` never has an `email` key, and a `/yours/<code>` page never prints the stored email.

---

### Task 1: Test runner

**Files:**
- Modify: `package.json` (add `"test": "vitest run"`, dev dependency `vitest`)
- Create: `vitest.config.ts` (uses `getViteConfig` from `astro/config`)
- Test: `src/admin/groups.test.ts`

- [ ] **Step 1:** `npm i -D vitest`
- [ ] **Step 2:** Write a smoke test that pins existing behavior:

```ts
test("readDetails requires a name and an https website", () => {
  const f = new FormData(); f.set("website", "example.com");
  const { errors } = readDetails(f);
  expect(errors.name).toBeTruthy();
  expect(errors.website).toBeTruthy();
});
```

- [ ] **Step 3:** Run `npm test`. Expected: 1 passed.
- [ ] **Step 4:** Commit: "Add Vitest".

### Task 2: Tables and rules

**Files:**
- Create: `db/migrations/0003_organizers.sql`
- Modify:
  - `CLAUDE.md`: the hard rules, the Tally section ("being replaced, see spec"), and the plan
  - `PRODUCT.md`: Operating Context, Capabilities and Constraints, Principle 3 note ("nothing to join" is for visitors)
  - `scripts/fetch-from-d1.mjs`: guard

**Interfaces:**
- Produces the tables `people`, `org_people`, `invites`, `submissions` and `org_answers`, exactly as in the spec's Data section. Additions:
  - `people.email` is `UNIQUE COLLATE NOCASE`.
  - `submissions.person_id` is `NOT NULL`.
  - CHECK constraints on every enum column use the keys in Global Constraints.
  - Indexes on `submissions(status)`, `invites(org_id)` and `org_answers(org_id)`.
- The top-of-file comment states the new contact rule.

- [ ] **Step 1:** Write the migration and apply it with `npm run db:migrate:local`. Expected: "0003_organizers.sql ✅".
- [ ] **Step 2:** Check it: `npx wrangler d1 execute newtonova --local --command "INSERT INTO submissions (id, kind, via, person_id, status) VALUES ('x','confirm','invite',NULL,'pending')"`. Expected: NOT NULL constraint failed.
- [ ] **Step 3:** In `fetch-from-d1.mjs`, throw if any written org or event object has a key matching `/email|person/i`. Run `node scripts/fetch-from-d1.mjs` (local). Expected: writes files, no throw.
- [ ] **Step 4:** Rewrite the two rules in CLAUDE.md and PRODUCT.md, word for word from the spec's "Rule changes".
- [ ] **Step 5:** Apply the migration to staging (command in Global Constraints).
- [ ] **Step 6:** Commit: "Add organizer tables; update contact and blurb rules".

### Task 3: Organizer logic (people, invites, submissions)

**Files:**
- Create: `src/organizers/people.ts`, `src/organizers/invites.ts`, `src/organizers/submissions.ts`
- Test: `src/organizers/people.test.ts`, `src/organizers/invites.test.ts`

**Interfaces (Produces):**
- `people.ts`
  - `type Who = { name: string; email: string; role: string }`
  - `readWho(form: FormData, opts: { emailKnown: boolean }): { values: Who; errors: Partial<Record<keyof Who, string>> }`. Trims all fields and lowercases the email. Name is required. Email is required unless `emailKnown`, and when present it must contain `@` and a dot after it.
  - `savePerson(db: D1Database, who: { name: string; email: string }): Promise<string>`. Upserts by email and returns the `people.id`.
  - `linkPerson(db: D1Database, orgId: string, personId: string, role: string): Promise<void>`. Inserts or ignores.
- `invites.ts`
  - `newCode(): string`. 16 bytes from `crypto.getRandomValues`, base64url, no padding.
  - `type Invite = { code: string; orgId: string; personId: string | null; personName: string | null; personEmail: string | null; orgStatus: string }`
  - `findInvite(db: D1Database, code: string): Promise<Invite | null>`. Returns null when the code is unknown or revoked.
  - `makeInvite(db, orgId: string, personId: string | null): Promise<string>`. Revokes the org's active code and inserts a new one.
  - `activeInvite(db, orgId: string): Promise<string | null>`
  - `revokeInvite(db, orgId: string): Promise<void>`
- `submissions.ts`
  - `type Kind = "confirm" | "change" | "remove" | "new"`
  - `createSubmission(db, s: { kind: Kind; orgId: string | null; personId: string; via: "invite" | "public"; inviteCode: string | null; proposed: GroupDetails | null; note: string }): Promise<string>`. Before inserting, it deletes any *pending* submission with the same `inviteCode` and `kind` (Review Focus 2).
  - `lastPending(db, orgId: string): Promise<{ createdAt: string } | null>`

- [ ] **Step 1:** Write the failing tests:

```ts
test("readWho trims and lowercases email", () => {
  const f = new FormData(); f.set("name", " Sam "); f.set("email", " Sam@X.com ");
  expect(readWho(f, { emailKnown: false }).values).toMatchObject({ name: "Sam", email: "sam@x.com" });
});
test("readWho needs email only when not known", () => {
  const f = new FormData(); f.set("name", "Sam");
  expect(readWho(f, { emailKnown: false }).errors.email).toBeTruthy();
  expect(readWho(f, { emailKnown: true }).errors.email).toBeUndefined();
});
test("newCode is 22 url-safe characters and differs each time", () => {
  const a = newCode(), b = newCode();
  expect(a).toMatch(/^[A-Za-z0-9_-]{22}$/); expect(a).not.toBe(b);
});
```

- [ ] **Step 2:** Run `npm test`. Expected: the 3 new tests fail (module not found).
- [ ] **Step 3:** Implement the three modules to match the signatures above.
- [ ] **Step 4:** Run `npm test`. Expected: all pass.
- [ ] **Step 5:** Commit: "Add organizer people, invites and submissions".

### Task 4: Shared flyer and the "Is this right?" page

**Files:**
- Create:
  - `src/components/Flyer.astro`: the `<li class="flyer">` markup moved out of `src/pages/index.astro`, with props `{ org: Org; index: number; next: NextEvent[]; claimHref: string; showTabs?: boolean }`
  - `src/pages/yours/[code].astro`
  - `src/layouts/Organizer.astro`: Base look without Umami, `noindex`
  - `src/styles/yours.css`
- Modify:
  - `src/pages/index.astro`: use `<Flyer>`, with the homepage looking identical
  - `src/middleware.ts`: add no-store and noindex headers for `/yours/`
  - `src/copy.ts`: add `copy.yours`

**Interfaces:**
- Consumes `findInvite`, `readWho`, `savePerson`, `linkPerson` and `createSubmission` from Task 3.
- Produces: `[code].astro` handles `GET` and `POST` with `step` taken from `?step=` (`check` by default, then `fix`, `remove`, `about`, `thanks`). This task builds `check` and `thanks`. After a POST it redirects to `?step=about&s=<submissionId>`.

- [ ] **Step 1:** Extract `Flyer.astro`. Run `npm run build`, open `/` in the browser, and confirm the flyers look unchanged.
- [ ] **Step 2:** Build the `check` step, as in the mockup:
  - The progress line component, `src/components/Steps.astro`, with props `{ current: 1 | 2 | 3 }`.
  - The flyer, rendered from the D1 row, with `showTabs=false`. Its next-event tab is labelled "Next event".
  - "Looks good" (a submit button) / "Fix something" / "Take us off the list".
  - The line "Sending as <name>. Not Sam?" under "Looks good". The "Not Sam?" button (`aria-expanded`) reveals name, email and role.
  - When the invite has no name, the fields show open from the start.
- [ ] **Step 3:** The POST for `check`:
  1. `readWho`. On errors, re-render with the errors.
  2. `savePerson`, using the new email or else the invite's email.
  3. `linkPerson`.
  4. `createSubmission({ kind: "confirm", via: "invite", … })`.
  5. Redirect.
- [ ] **Step 4:** Handle unknown or revoked codes, and invites whose `orgStatus !== "Live"`, by rendering `copy.yours.gone` with status 404 (Review Focus 1).
- [ ] **Step 5:** Check locally:
  1. Insert an invite for a Live org with `wrangler d1 execute --local`.
  2. Open `/yours/<code>` and submit "Looks good".
  3. `SELECT * FROM submissions`. Expected: one pending `confirm` row with `person_id` set.
  4. Refresh the redirected page. Expected: still one row.
  5. View the page source. Expected: the invite's email doesn't appear (Review Focus 5).
  6. Try a bad code. Expected: the friendly 404 page.
- [ ] **Step 6:** Commit: "Add the organizer check page". Push to `staging` and check it there with a code inserted into the staging database.

### Task 5: Fix something, and take us off

**Files:**
- Modify: `src/pages/yours/[code].astro`, `src/copy.ts`, `src/styles/yours.css`
- Reuse: `src/components/GroupFields.astro` (pass a `blurbHint` prop; add it to the component as an optional prop)

**Interfaces:** Consumes `readDetails` from `src/admin/groups.ts` (with `keep` set to the org's current lists) and `createSubmission`.

- [ ] **Step 1:** `?step=fix`:
  - `GroupFields` prefilled from the org, given an `owner` prop that switches on the mockup layout:
    - Kinds and towns as a summary line with a **Change** button, which opens a two-column tick grid. Towns are grouped by route, with place dots.
    - The five newcomer fields behind an "Add details for newcomers" button.
    - Without `owner`, `/admin` keeps today's layout.
  - The blurb hint: "What would someone new want to know before showing up?"
  - An "Anything else I should know?" textarea (`note`).
  - The Who box.
  - The POST validates with `readDetails` plus `readWho`, then calls `createSubmission({ kind: "change", proposed: values, note })`.
- [ ] **Step 2:** `?step=remove`:
  - One optional "Mind telling me why?" line, plus the Who box.
  - The POST calls `createSubmission({ kind: "remove", note })`.
- [ ] **Step 3:** Check locally:
  - Submit a change twice. Expected: one pending `change` row holding the second version (Review Focus 2).
  - Submit an empty name. Expected: the form comes back with the inline error and the typed values kept.
  - Check on a phone-width real browser tab.
- [ ] **Step 4:** Commit: "Let organizers fix or remove their listing". Push to `staging`.

### Task 6: Help me help groups like yours, thanks, coming back

**Files:**
- Create: `src/organizers/answers.ts`, `src/organizers/answers.test.ts`
- Modify: `src/pages/yours/[code].astro`, `src/copy.ts`

**Interfaces (Produces):**
- `STRUGGLES: readonly string[]`, the keys in Global Constraints. The labels are in `copy.yours.about.struggles[key]`.
- `type Answers = { struggles: string[]; struggleOther: string; handOff: string; chat: "yes" | "maybe" | "no" | null; connect: "online" | "in_person" | "either" | "no" | null; profile: "yes" | "ask" | "no" | null }`
- `readAnswers(form: FormData): Answers`. Drops unknown keys, trims text, and caps each text field at 1000 characters.
- `isEmpty(a: Answers): boolean`
- `saveAnswers(db, a: Answers, ctx: { orgId: string | null; personId: string; submissionId: string }): Promise<void>`

- [ ] **Step 1:** Write the failing tests:

```ts
test("readAnswers keeps only known keys", () => {
  const f = new FormData(); f.append("struggles", "space"); f.append("struggles", "hack"); f.set("chat", "maybe");
  expect(readAnswers(f)).toMatchObject({ struggles: ["space"], chat: "maybe", connect: null });
});
test("isEmpty is true for an untouched form", () => {
  expect(isEmpty(readAnswers(new FormData()))).toBe(true);
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `answers.ts`. Run `npm test`. Expected: PASS.
- [ ] **Step 4:** Build the `about` step:
  - The five questions from the spec's table, with a "Skip" link to `thanks`. They use the mockup patterns, with real inputs that are visually hidden but still focusable:
    - Struggles: tick rows, with the shorter labels and their sublines.
    - Chat and profile: the segmented switch.
    - Connect: rows with round markers.
    - Tapping a picked one-answer option clears it (a small script; without it, the form still works).
  - The POST saves only when `!isEmpty`. The person and org come from the submission `s`, which must belong to this invite code.
- [ ] **Step 5:** Build `thanks`: "Thanks, <name>. I'll look at this within a week.", plus the chat line if `chat === "yes"`, and a link to `/#org-<id>`.
- [ ] **Step 6:** Coming back: on `check`, if `lastPending(orgId)` exists, show "You sent me changes on <date>. They're waiting for me to look at them."
- [ ] **Step 7:** Check locally and at phone width. Commit: "Add the help-me-help step". Push to `staging`.

### Task 7: Review queue in /admin (may take two blocks)

**Files:**
- Create: `src/admin/review.ts`, `src/admin/review.test.ts`, `src/pages/admin/review/index.astro`, `src/pages/admin/review/[id].astro`
- Modify:
  - `src/layouts/Admin.astro`: `section` gains `"review"`; a header link with the pending count
  - `src/pages/admin/groups/[id].astro`: accept a `?review=<id>` prefill, so the change and new reviews reuse the real group form
  - `src/copy.ts`

**Interfaces (Produces):**
- `changedFields(current: GroupDetails, proposed: GroupDetails): (keyof GroupDetails)[]`. Compares arrays ignoring order and strings after trimming.
- `listPending(db): Promise<PendingRow[]>`, newest first. `PendingRow = { id; kind; orgId; orgName; personName; via; createdAt }`, where `orgName` is the proposed name for `new`.
- `pendingCount(db): Promise<number>`
- `getSubmission(db, id): Promise<Submission | null>`
- `decide(db, id: string, outcome: "approved" | "declined"): Promise<void>`. Sets `status` and `decided_at`.
- `approveConfirm(db, id)` sets `verified = 1` and `updated_at`, then calls `decide`.
- `approveRemove(db, id)` sets `status = 'Removed'` and `updated_at`, then calls `decide`.
- Approving a change or new group goes through the group form. Saving the form when `?review=<id>` is present calls `saveGroup` with `verified = true`, then `decide(id, "approved")`. A new group defaults to Status `Ready` and also gets `linkPerson`, plus `UPDATE org_answers SET org_id` for that submission.

- [ ] **Step 1:** Write the failing tests:

```ts
test("changedFields ignores list order and whitespace", () => {
  const a = { ...base, category: ["Creative", "Social"], blurb: "Hi" };
  const b = { ...base, category: ["Social", "Creative"], blurb: " Hi " };
  expect(changedFields(a, b)).toEqual([]);
});
test("changedFields lists real differences", () => {
  expect(changedFields(base, { ...base, website: "https://new.example" })).toEqual(["website"]);
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL. Implement it, then run again. Expected: PASS.
- [ ] **Step 3:** Build the review list page and the confirm/remove review page (flyer, person, note, Approve / Decline).
- [ ] **Step 4:** Group form with `?review=<id>`:
  - Prefill from `proposed`.
  - Mark the fields in `changedFields(currentRow, proposed)`, computed from the row **at review time** (Review Focus 4), and show the current value under each.
  - Add a Decline button.
- [ ] **Step 5:** Check locally:
  - Run one submission of each kind through approve. Expected: the org row changes as the spec says, the submission disappears from the list, and the header count drops.
  - Edit a group in `/admin`, then review an older change for it. Expected: only the fields that really differ are marked.
- [ ] **Step 6:** Commit: "Add the review queue".

### Task 8: Copy invite, organizers box, answers page

**Files:**
- Create: `src/organizers/invite-email.ts`, `src/organizers/invite-email.test.ts`, `src/pages/admin/answers.astro`
- Modify: `src/pages/admin/groups/[id].astro`, `src/admin/groups.ts` (only if a query helper is needed), `src/layouts/Admin.astro` (Answers link), `src/copy.ts` (`copy.admin.invite`, a placeholder email draft from the spec)

**Interfaces (Produces):**
- `inviteEmail(o: { name: string; area: string[]; category: string[]; blurb: string }, firstName: string, link: string): { subject: string; body: string }`. Uses the draft in the spec's outreach section. The blurb is cut at about 120 characters on a word boundary, with "…". With no first name, it opens "Hi there,".
- `countAnswers(rows: Answers[]): Record<string, number>`, keyed as `struggles.marketing`, `chat.yes`, and so on.

- [ ] **Step 1:** Write the failing tests:

```ts
test("inviteEmail fills name, link and a short blurb", () => {
  const { subject, body } = inviteEmail({ name: "Sketch Club", area: ["Arlington"], category: ["Creative"], blurb: "x ".repeat(100) }, "Sam", "https://newtonova.org/yours/abc");
  expect(subject).toBe("Sketch Club is on new to nova");
  expect(body).toContain("Hi Sam,"); expect(body).toContain("https://newtonova.org/yours/abc");
  expect(body).toContain("…");
});
test("countAnswers counts each key", () => {
  expect(countAnswers([a({ struggles: ["space"], chat: "yes" }), a({ struggles: ["space", "tech"] })]))
    .toMatchObject({ "struggles.space": 2, "struggles.tech": 1, "chat.yes": 1 });
});
```

- [ ] **Step 2:** Run `npm test`. Expected: FAIL. Implement it, then run again. Expected: PASS.
- [ ] **Step 3:** On the group edit page (Live groups only), build the **Organizers** box:
  - Linked people: name, email, role, last sent.
  - **Copy invite**: a small form with first name and email. The POST calls `savePerson` + `linkPerson` + `makeInvite` (or reuses `activeInvite`), then re-renders with the email text in a `<textarea>` and a Copy button (`navigator.clipboard.writeText`). The link uses `Astro.url.origin`.
  - **Copy link only** and **Revoke link**.
  - **Their answers**: the latest answers for this group.
- [ ] **Step 4:** `/admin/answers/`:
  - Counts from `countAnswers`, shown as "12 of 20".
  - All hand-off answers with the group name.
  - "Said yes to a chat" and "Wants to connect" lists with name, email and group.
- [ ] **Step 5:** Check locally, end to end:
  1. Copy invite for a Live group.
  2. Open the link and go through every step.
  3. Approve it in review.
  4. See the answers counted.
- [ ] **Step 6:** Commit: "Add invites and the answers page".
- [ ] **Step 7:** Getting it live:
  1. Apply 0003 to the real database (`npm run db:migrate`).
  2. Merge `staging` into `main`.
  3. Becca can start sending emails. Tally stays up for the public until Task 9.

### Task 9: Public path

**Files:**
- Create: `src/pages/yours/index.astro` (search over Live groups, `?org=<id>` jump, `?step=new`), `src/organizers/turnstile.ts`
- Modify:
  - `src/pages/yours/[code].astro`: pull the steps into shared partials or components, so `/yours/?org=<id>` reuses them with `via: "public"` and `emailKnown: false`
  - `wrangler.jsonc`: `TURNSTILE_SITE_KEY` var, top level and in `env.staging`
  - `src/copy.ts`

**Interfaces (Produces):** `verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean>`. POSTs to `https://challenges.cloudflare.com/turnstile/v0/siteverify`.

- [ ] **Step 1:** Create a Turnstile widget in the Cloudflare dashboard (free) for newtonova.org and the staging workers.dev host. Set the secret with `npx wrangler secret put TURNSTILE_SECRET` (and with `--env staging`). Locally, use Cloudflare's published test keys, kept in `.dev.vars`.
- [ ] **Step 2:** Build `/yours/`:
  - A search box that filters a server-rendered list of Live groups by name.
  - Each result links to `?org=<id>`.
  - "Add your group" links to `?step=new`.
  - A group that isn't Live or doesn't exist shows `copy.yours.gone`.
- [ ] **Step 3:** The public steps:
  - Same as Tasks 4–6, but the email is required.
  - The Turnstile widget is on every POST form.
  - The POST rejects with "Please try again" when `verifyTurnstile` is false.
  - `new` uses a blank `GroupFields` and `createSubmission({ kind: "new", orgId: null, proposed })`.
- [ ] **Step 4:** Check on `staging`: claim an existing group and add a new one. Then check locally that both show up in review and that approving the new group creates it with Status Ready.
- [ ] **Step 5:** Commit: "Add the public organizer path".

### Task 10: Design pass, retire Tally, ship

**Files:**
- Modify:
  - `src/pages/index.astro`: `claimHref` becomes `/yours/?org=<id>`, no `target="_blank"`
  - `src/pages/about.astro`, `src/layouts/Base.astro` (footer), `src/pages/events.astro`: point to `/yours/`
  - `src/copy.ts`: remove `TALLY_URL`
  - `CLAUDE.md`, `PRODUCT.md`: replace the Tally sections with the organizer flow
  - `src/styles/yours.css`

- [ ] **Step 1:** Run an Impeccable critique of `/yours/<code>` (all steps) and `/yours/` at desktop and phone width against DESIGN.md. Fix what it finds.
- [ ] **Step 2:** `grep -rn "tally\|TALLY" src/`. Expected: no matches.
- [ ] **Step 3:** Run `npm test` and `npm run build`. Expected: both pass.
- [ ] **Step 4:** Commit: "Retire the Tally form". Push to `staging`, check it, then merge to `main`. Turn the Tally form off once Becca confirms nothing is waiting in it.

### Task 11 (optional): Email Becca on each new submission

**Files:**
- Modify: `wrangler.jsonc` (`send_email` binding with Becca's verified Email Routing destination address)
- Create: `src/organizers/notify.ts`

**Interfaces:** `notifyBecca(env, s: { kind: Kind; orgName: string; personName: string }): Promise<void>`. Called after `createSubmission`. A failure is logged and never blocks the organizer.

- [ ] **Step 1:** Set it up, submit a test, and confirm the email arrives with a link to `/admin/review/<id>`. The email body contains no organizer email. Commit: "Email Becca on new organizer submissions".
