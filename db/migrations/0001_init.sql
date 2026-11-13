-- Groups and events, moved from the two Notion databases.
-- Ids are the Notion page ids, so /#org-<id> links, the Tally prefill and
-- /events/<id>.ics keep working.
-- Category and area lists are JSON arrays of names, e.g. '["Creative","Social"]'.
-- The allowed names live in src/categories.ts and src/areas.ts.
-- No contact details in either table.

CREATE TABLE orgs (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  website         TEXT,
  blurb           TEXT,
  category        TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(category)),
  area            TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(area)),
  status          TEXT NOT NULL DEFAULT 'Collecting'
                  CHECK (status IN ('Collecting', 'Ready', 'Live', 'Removed')),
  verified        INTEGER NOT NULL DEFAULT 0,
  found_via       TEXT,    -- internal, never shown
  events_page     TEXT,    -- internal
  where_text      TEXT,    -- address, for the map later
  no_fixed_place  INTEGER NOT NULL DEFAULT 0,

  -- New details, empty until filled in. Not shown on the site yet.
  schedule        TEXT,    -- e.g. "Second Tuesdays, 7pm"
  cost            TEXT,    -- e.g. "Free" or "$10 a session"
  accessibility   TEXT,
  ages            TEXT,
  first_time      TEXT,    -- what to expect your first time

  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE events (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  start       TEXT NOT NULL,   -- as Notion gives it: "2026-11-12" (all day) or "2026-11-12T18:00:00.000-05:00"
  "end"       TEXT,
  all_day     INTEGER NOT NULL DEFAULT 0,
  link        TEXT,
  org_id      TEXT REFERENCES orgs(id) ON DELETE SET NULL,
  area        TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(area)),
  where_text  TEXT,
  category    TEXT,            -- used only when the event has no Live org
  summary     TEXT,            -- newsletter only, never on the site
  status      TEXT NOT NULL DEFAULT 'Collecting'
              CHECK (status IN ('Collecting', 'Ready', 'Live', 'Removed')),

  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX events_status_start ON events (status, start);
CREATE INDEX events_org ON events (org_id);
