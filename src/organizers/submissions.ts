// What organizers send. Nothing here touches orgs: Becca approves each one in /admin.
import type { GroupDetails } from "../admin/groups";

export type Kind = "confirm" | "change" | "remove" | "new";

export type NewSubmission = {
  kind: Kind;
  orgId: string | null;
  personId: string;
  via: "invite" | "public";
  inviteCode: string | null;
  proposed: GroupDetails | null;
  note: string;
};

// Saves a submission and returns its id. A newer pending one of the same kind
// from the same link replaces the older one, so a refresh or a second try
// leaves a single item for Becca to review.
export async function createSubmission(db: D1Database, s: NewSubmission): Promise<string> {
  const id = crypto.randomUUID();
  const stmts: D1PreparedStatement[] = [];
  if (s.inviteCode) {
    stmts.push(
      db
        .prepare("DELETE FROM submissions WHERE invite_code = ?1 AND kind = ?2 AND status = 'pending'")
        .bind(s.inviteCode, s.kind),
    );
  }
  stmts.push(
    db
      .prepare(
        `INSERT INTO submissions (id, kind, org_id, person_id, via, invite_code, proposed, note)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
      )
      .bind(id, s.kind, s.orgId, s.personId, s.via, s.inviteCode, s.proposed ? JSON.stringify(s.proposed) : null, s.note || null),
  );
  await db.batch(stmts);
  return id;
}

// The newest pending submission for a group, for the "coming back" note.
export async function lastPending(db: D1Database, orgId: string): Promise<{ createdAt: string } | null> {
  const row = await db
    .prepare("SELECT created_at FROM submissions WHERE org_id = ?1 AND status = 'pending' ORDER BY created_at DESC LIMIT 1")
    .bind(orgId)
    .first<{ created_at: string }>();
  return row ? { createdAt: row.created_at } : null;
}

// A submission, checked to belong to this link (used by the steps after sending).
export async function submissionForInvite(db: D1Database, id: string, code: string) {
  return db
    .prepare("SELECT id, kind, org_id, person_id FROM submissions WHERE id = ?1 AND invite_code = ?2")
    .bind(id, code)
    .first<{ id: string; kind: Kind; org_id: string | null; person_id: string }>();
}
