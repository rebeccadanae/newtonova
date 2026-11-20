// /admin review queue: what organizers sent from /yours, waiting for Becca.
// Approving is the only way an organizer's submission reaches a group.
import { emptyGroup, fromRow, saveGroup, type Group, type GroupDetails, type OrgRow } from "./groups";
import type { Kind } from "../organizers/submissions";

const DETAIL_KEYS: (keyof GroupDetails)[] = [
  "name", "website", "blurb", "category", "area", "schedule", "cost",
  "accessibility", "ages", "first_time", "where_text", "no_fixed_place",
];

const norm = (v: unknown) =>
  Array.isArray(v) ? JSON.stringify([...v].map(String).sort()) : typeof v === "string" ? v.trim() : v;

// The detail fields where the proposal differs from the group as it is now.
export function changedFields(current: GroupDetails, proposed: GroupDetails): (keyof GroupDetails)[] {
  return DETAIL_KEYS.filter((k) => norm(current[k]) !== norm(proposed[k]));
}

export type PendingRow = {
  id: string;
  kind: Kind;
  orgId: string | null;
  orgName: string;
  personName: string;
  via: "invite" | "public";
  createdAt: string;
};

export async function listPending(db: D1Database): Promise<PendingRow[]> {
  const { results } = await db
    .prepare(
      `SELECT s.id, s.kind, s.org_id, s.via, s.created_at, o.name AS org_name,
              json_extract(s.proposed, '$.name') AS proposed_name, p.name AS person_name
       FROM submissions s
       JOIN people p ON p.id = s.person_id
       LEFT JOIN orgs o ON o.id = s.org_id
       WHERE s.status = 'pending'
       ORDER BY s.created_at DESC`,
    )
    .all<{ id: string; kind: Kind; org_id: string | null; via: "invite" | "public"; created_at: string; org_name: string | null; proposed_name: string | null; person_name: string }>();
  return results.map((r) => ({
    id: r.id,
    kind: r.kind,
    orgId: r.org_id,
    orgName: r.org_name ?? r.proposed_name ?? "",
    personName: r.person_name,
    via: r.via,
    createdAt: r.created_at,
  }));
}

export async function pendingCount(db: D1Database): Promise<number> {
  const row = await db.prepare("SELECT COUNT(*) AS n FROM submissions WHERE status = 'pending'").first<{ n: number }>();
  return row?.n ?? 0;
}

export type Submission = {
  id: string;
  kind: Kind;
  orgId: string | null;
  via: "invite" | "public";
  proposed: GroupDetails | null;
  note: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
  person: { id: string; name: string; email: string; role: string };
  answers: {
    struggles: string[];
    struggleOther: string;
    handOff: string;
    chat: string | null;
    connect: string | null;
    profile: string | null;
  } | null;
};

export async function getSubmission(db: D1Database, id: string): Promise<Submission | null> {
  const s = await db
    .prepare(
      `SELECT s.*, p.name AS person_name, p.email AS person_email, op.role AS person_role
       FROM submissions s
       JOIN people p ON p.id = s.person_id
       LEFT JOIN org_people op ON op.person_id = s.person_id AND op.org_id = s.org_id
       WHERE s.id = ?1`,
    )
    .bind(id)
    .first<{
      id: string; kind: Kind; org_id: string | null; via: "invite" | "public"; proposed: string | null; note: string | null;
      status: "pending" | "approved" | "declined"; created_at: string; person_id: string;
      person_name: string; person_email: string; person_role: string | null;
    }>();
  if (!s) return null;
  const a = await db
    .prepare("SELECT struggles, struggle_other, hand_off, chat, connect, profile FROM org_answers WHERE submission_id = ?1")
    .bind(id)
    .first<{ struggles: string; struggle_other: string | null; hand_off: string | null; chat: string | null; connect: string | null; profile: string | null }>();
  return {
    id: s.id,
    kind: s.kind,
    orgId: s.org_id,
    via: s.via,
    proposed: s.proposed ? (JSON.parse(s.proposed) as GroupDetails) : null,
    note: s.note ?? "",
    status: s.status,
    createdAt: s.created_at,
    person: { id: s.person_id, name: s.person_name, email: s.person_email, role: s.person_role ?? "" },
    answers: a
      ? {
          struggles: JSON.parse(a.struggles),
          struggleOther: a.struggle_other ?? "",
          handOff: a.hand_off ?? "",
          chat: a.chat,
          connect: a.connect,
          profile: a.profile,
        }
      : null,
  };
}

export async function decide(db: D1Database, id: string, outcome: "approved" | "declined"): Promise<void> {
  await db
    .prepare("UPDATE submissions SET status = ?1, decided_at = ?2 WHERE id = ?3 AND status = 'pending'")
    .bind(outcome, new Date().toISOString(), id)
    .run();
}

// "Looks good": the group is now confirmed by its organizer (verified_at dates it).
export async function approveConfirm(db: D1Database, s: Submission): Promise<void> {
  await db.batch([
    db.prepare("UPDATE orgs SET verified = 1, verified_at = ?1, updated_at = ?1 WHERE id = ?2").bind(new Date().toISOString(), s.orgId),
    db.prepare("UPDATE submissions SET status = 'approved', decided_at = ?1 WHERE id = ?2 AND status = 'pending'").bind(new Date().toISOString(), s.id),
  ]);
}

// "Take us off": keep the row (so it isn't re-added), set it to Removed.
export async function approveRemove(db: D1Database, s: Submission): Promise<void> {
  await db.batch([
    db.prepare("UPDATE orgs SET status = 'Removed', updated_at = ?1 WHERE id = ?2").bind(new Date().toISOString(), s.orgId),
    db.prepare("UPDATE submissions SET status = 'approved', decided_at = ?1 WHERE id = ?2 AND status = 'pending'").bind(new Date().toISOString(), s.id),
  ]);
}

// The group form's starting values when reviewing a change or a new group:
// the organizer's proposal over the group as it is now (admin fields kept).
export function reviewValues(s: Submission, current: OrgRow | null): Group {
  const base = current ? fromRow(current) : { ...emptyGroup(), status: "Ready" };
  return { ...base, ...(s.proposed ?? {}) };
}

// Saves an approved change or new group, marks it verified (dated), links the organizer
// and their answers to it, and closes the submission. Returns the group's id.
export async function approveWithGroup(db: D1Database, s: Submission, id: string | null, g: Group): Promise<string> {
  const savedId = await saveGroup(db, id, { ...g, verified: true });
  await db.batch([
    db.prepare("UPDATE orgs SET verified_at = ?1 WHERE id = ?2").bind(new Date().toISOString(), savedId),
    db.prepare("INSERT OR IGNORE INTO org_people (org_id, person_id, role) VALUES (?1, ?2, ?3)").bind(savedId, s.person.id, s.person.role || null),
    db.prepare("UPDATE org_answers SET org_id = ?1 WHERE submission_id = ?2 AND org_id IS NULL").bind(savedId, s.id),
    db.prepare("UPDATE submissions SET status = 'approved', decided_at = ?1 WHERE id = ?2 AND status = 'pending'").bind(new Date().toISOString(), s.id),
  ]);
  return savedId;
}
