-- When a group's organizer last confirmed it: set when Becca approves a
-- "Looks good", a change or a new group in To review. The flyer shows
-- "Confirmed by the group, <month>" when verified = 1 and this is set.
ALTER TABLE orgs ADD COLUMN verified_at TEXT;
