-- When the site was last published, for the Publish bar in /admin.
--   requested: Becca pressed Publish (the Deploy Hook was called).
--   built:     a Cloudflare build finished; `at` is when it read D1, so any
--              group or event with updated_at after it isn't on the site yet.
CREATE TABLE publishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('requested', 'built')),
  at TEXT NOT NULL,
  build_id TEXT
);
