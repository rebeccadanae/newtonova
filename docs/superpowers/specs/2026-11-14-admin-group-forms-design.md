# Admin group forms (phase 2, block 3)

## Why
Becca edits groups in Notion today. Phase 2 moves editing to `/admin` so Notion can come out of the build (block 5). Later (phase 3) group owners will suggest or update groups through a similar form.

## Goals
- Edit any group, and add a new one, from `/admin`.
- Admin edits survive the Notion import that still runs on every build.

## Non-goals
- No owner-facing form yet (phase 3: accounts, claims, an edit queue Becca approves).
- No delete: set Status to Removed.
- No live public pages: edits show after the next rebuild, as now.

## Approaches considered
1. **Newest edit wins (chosen).** The import only overwrites a D1 org when Notion's `last_edited_time` is newer than D1's `updated_at`. Edits survive builds and editing in Notion stays harmless. Trade-off: groups live in two places until block 5; habit is "once edited in admin, edit there".
2. Stop importing orgs once the forms work. Single source of truth, but Notion events can't link to admin-made groups until block 4.
3. Build the forms but lock them until block 5. Safe but unusable for weeks.

## Design
- **Import:** the org upsert gets `WHERE excluded.updated_at > orgs.updated_at`. Events unchanged.
- **Routes:** `/admin/groups/new` and `/admin/groups/<id>`, server-rendered, under the existing Access lock and middleware check. Each name in the list links to its edit page; a "New group" button sits on the list.
- **Form:** plain HTML POST to the same URL. Fields: name (required), website, blurb, kinds and towns (checkboxes from `src/categories.ts` / `src/areas.ts`), schedule, cost, accessibility, ages, first time, where, no fixed place, then admin-only: status (select, incl. Removed), verified, found via, events page.
- **Reuse for owners later:** the shared group fields are one component; the admin-only fields are a separate block. A future owner form reuses the shared component and saves into an edit queue instead of `orgs`.
- **Saving:** validate (name present; website/found via are http(s) URLs; kinds, towns and status only from the allowed lists; trim text, empty becomes NULL). On error, redisplay the form with the entered values and messages. On success set `updated_at` to now and redirect to `/admin/` with a "Saved" note.
- **New ids:** `crypto.randomUUID()`, same shape as Notion page ids. `/#org-<id>`, the Tally `org_id` prefill and `.ics` links only pass the id through, so they work unchanged.
- **Copy:** labels in `copy.admin` in `src/copy.ts`.

## Left to the builder
Exact layout within the existing admin sheet styles; how errors are shown (inline under each field is the default).
