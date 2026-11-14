# Admin event forms and repeating events (phase 2, block 4a and 4b)

## Why
Events are still edited in Notion and overwritten from it on every build. Block 4 moves event editing into `/admin`, like groups (block 3), so Notion can come out of the build in block 5. Many events are a group's regular meetup ("3rd Tuesday, 7pm"), so entering repeats has to be quick.

## Goals
- List, edit and add events in `/admin`.
- Repeat an event quickly: copy one, or enter a repeat rule that makes the dates for you.
- Admin edits survive the Notion import until block 5.

## Non-goals
- No changes to the public Events page, Coming up, or `.ics` files: every date stays an ordinary event row.
- No delete: set Status to Removed (including for one skipped date in a series).
- No owner-entered events (phase 4).

## Approaches considered (repeats)
1. **A rule makes dated copies (chosen).** Saving a repeat creates one event row per date, tagged with a shared series id. Everything after the form is unchanged. Trade-off: a series stops at its end date and needs extending now and then.
2. Store the rule; the build expands it. Never runs out, but every event consumer and the `.ics` files would need reworking around generated dates, plus an exceptions list for single-date changes. Roughly twice the work.

For builds vs. edits, events get the same "newest edit wins" rule as groups (block 3).

## Block 4a: list, form, copy

- **Import:** event upsert gets `newerOnly: true` in `scripts/import-from-notion.mjs`.
- **Admin nav:** Groups · Events links in the admin header (`src/layouts/Admin.astro`), current one marked.
- **List** `/admin/events/`: upcoming by default (end or start on/after today, New York time), "Past" link; search on event name and group name; status links with counts that follow the search. Columns: date and time, name, group, towns, status. Each name opens the edit page; "New event" button.
- **Form** `/admin/events/<id>` and `/admin/events/new` (one page, like groups), posting back to itself:
  - Name (required), Link (http/https URL), Group (select of every group by name, non-Live ones marked with their status; "No group" allowed), Towns (checkboxes grouped as on the group form), Where, Kind (select from the category list, with a hint that it's only used when the event has no Live group), Summary (textarea, "newsletter only"), Status (default Live for new events, my call: events are entered when ready).
  - When: Date (required), Start time (optional; empty = all day), End date (optional), End time (optional).
  - Stored as Notion stores it: all day = `"2026-11-17"`; timed = `"2026-11-17T19:00:00.000-05:00"` with the New York offset for that date (-05:00 or -04:00). End follows the same shape; end before start is an error. `all_day` set from whether a start time was given.
- **Copy as new event:** a link on the edit page to `/admin/events/new?from=<id>`, which prefills every field except the date.
- Shared reading/checking/saving in `src/admin/events.ts`; time-zone helpers reuse `src/event-dates.ts` where they fit.

## Block 4b: repeats

- **Migration** `db/migrations/0002_event_series.sql`: `series_id TEXT` on events, plus an index.
- **Repeats section** on the new-event form only: Doesn't repeat / Every week / Every 2 weeks / Monthly on the Nth weekday (worked out from the date, e.g. "3rd Tuesday"; "last Tuesday" offered when the date is in the last week of the month) / Repeat until (date, required when repeating, at most 12 months out, default 3 months). Saving creates one row per date with the same times, the same fields and a new shared `series_id`.
- **Editing a series event:** the form shows "Part of a series: N dates, until <date>" and asks "Save to: this event only / this and later ones". "This and later" applies every field except the date to events in the series starting on or after this one, keeping each one's own date (a new start or end time applies to each).
- **Ending soon:** the events list flags series whose last Live date is within 30 days, with a way to extend: a "Repeat until" on the series that adds the missing dates.

## Left to the builder
Layout within the admin sheet styles; how many past events to show per page (all is fine at this size).
