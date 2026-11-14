-- Repeating events (phase 2, block 4b).
-- A repeat rule makes one ordinary event row per date; the rows share a series.
-- The series keeps the rule so the dates can be extended later.

CREATE TABLE series (
  id          TEXT PRIMARY KEY,
  repeat      TEXT NOT NULL CHECK (repeat IN ('weekly', 'biweekly', 'monthly', 'monthly-last')),
  until       TEXT NOT NULL,   -- last day dates were made up to, "2027-02-14"
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

ALTER TABLE events ADD COLUMN series_id TEXT REFERENCES series(id);

CREATE INDEX events_series ON events (series_id);
