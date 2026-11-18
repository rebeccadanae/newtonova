-- Organizers (the flow that replaces the Tally form).
-- Spec: docs/superpowers/specs/2026-11-18-organizer-flow-design.md
--
-- Contact rule (changed 2026-11-18): an organizer's own name and email may be
-- stored here so Becca can reply and they can come back later. They are never
-- shown on the site, never written to orgs.json or events.json, and never
-- committed. Subscriber details still stay in Kit.
--
-- Named so Better Auth's own `user` table can link in later with one column
-- (people.user_id).

-- One row per organizer, matched by email.
CREATE TABLE people (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Who runs which group. trusted is for later (changes go live without review).
CREATE TABLE org_people (
  org_id      TEXT NOT NULL REFERENCES orgs(id),
  person_id   TEXT NOT NULL REFERENCES people(id),
  role        TEXT,
  trusted     INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  PRIMARY KEY (org_id, person_id)
);

-- Personal links: /yours/<code>. One active (not revoked) code per group.
CREATE TABLE invites (
  code        TEXT PRIMARY KEY,
  org_id      TEXT NOT NULL REFERENCES orgs(id),
  person_id   TEXT REFERENCES people(id),
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  revoked_at  TEXT
);

CREATE INDEX invites_org ON invites (org_id);

-- Everything an organizer sends. Nothing reaches orgs until Becca approves it.
CREATE TABLE submissions (
  id           TEXT PRIMARY KEY,
  kind         TEXT NOT NULL CHECK (kind IN ('confirm', 'change', 'remove', 'new')),
  org_id       TEXT REFERENCES orgs(id),          -- null for a new group
  person_id    TEXT NOT NULL REFERENCES people(id),
  via          TEXT NOT NULL CHECK (via IN ('invite', 'public')),
  invite_code  TEXT REFERENCES invites(code),
  proposed     TEXT CHECK (proposed IS NULL OR json_valid(proposed)),  -- group fields, for change/new
  note         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'declined')),
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  decided_at   TEXT,
  CHECK ((kind = 'new') = (org_id IS NULL))
);

CREATE INDEX submissions_status ON submissions (status);
CREATE INDEX submissions_org ON submissions (org_id);

-- "Help me help groups like yours" answers. For Becca only.
CREATE TABLE org_answers (
  id              TEXT PRIMARY KEY,
  org_id          TEXT REFERENCES orgs(id),       -- filled in when a new group is approved
  person_id       TEXT NOT NULL REFERENCES people(id),
  submission_id   TEXT NOT NULL REFERENCES submissions(id),
  struggles       TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(struggles)),
  -- keys: new_people, marketing, space, tech, admin, money, volunteers, other
  struggle_other  TEXT,
  hand_off        TEXT,
  chat            TEXT CHECK (chat IN ('yes', 'maybe', 'no')),
  connect         TEXT CHECK (connect IN ('online', 'in_person', 'either', 'no')),
  profile         TEXT CHECK (profile IN ('yes', 'ask', 'no')),
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX org_answers_org ON org_answers (org_id);
