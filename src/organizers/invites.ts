// Personal links: /yours/<code>. A code only lets someone *suggest* changes
// (everything waits for Becca), so it's stored as is and can be copied again.

// 16 random bytes as base64url: 22 characters, no padding.
export function newCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export type Invite = {
  code: string;
  orgId: string;
  personId: string | null;
  personName: string | null;
  personEmail: string | null;
  orgStatus: string;
};

const CODE = /^[A-Za-z0-9_-]{22}$/;

// The invite for a code, or null if it's unknown, malformed or revoked.
export async function findInvite(db: D1Database, code: string): Promise<Invite | null> {
  if (!CODE.test(code)) return null;
  const row = await db
    .prepare(
      `SELECT i.code, i.org_id, i.person_id, p.name AS person_name, p.email AS person_email, o.status AS org_status
       FROM invites i
       JOIN orgs o ON o.id = i.org_id
       LEFT JOIN people p ON p.id = i.person_id
       WHERE i.code = ?1 AND i.revoked_at IS NULL`,
    )
    .bind(code)
    .first<{ code: string; org_id: string; person_id: string | null; person_name: string | null; person_email: string | null; org_status: string }>();
  if (!row) return null;
  return {
    code: row.code,
    orgId: row.org_id,
    personId: row.person_id,
    personName: row.person_name,
    personEmail: row.person_email,
    orgStatus: row.org_status,
  };
}

export async function activeInvite(db: D1Database, orgId: string): Promise<string | null> {
  const row = await db
    .prepare("SELECT code FROM invites WHERE org_id = ?1 AND revoked_at IS NULL ORDER BY created_at DESC LIMIT 1")
    .bind(orgId)
    .first<{ code: string }>();
  return row?.code ?? null;
}

export async function revokeInvite(db: D1Database, orgId: string): Promise<void> {
  await db
    .prepare("UPDATE invites SET revoked_at = ?1 WHERE org_id = ?2 AND revoked_at IS NULL")
    .bind(new Date().toISOString(), orgId)
    .run();
}

// Revokes the group's current code and makes a new one. Returns the new code.
export async function makeInvite(db: D1Database, orgId: string, personId: string | null): Promise<string> {
  const code = newCode();
  const now = new Date().toISOString();
  await db.batch([
    db.prepare("UPDATE invites SET revoked_at = ?1 WHERE org_id = ?2 AND revoked_at IS NULL").bind(now, orgId),
    db.prepare("INSERT INTO invites (code, org_id, person_id, created_at) VALUES (?1, ?2, ?3, ?4)").bind(code, orgId, personId, now),
  ]);
  return code;
}
