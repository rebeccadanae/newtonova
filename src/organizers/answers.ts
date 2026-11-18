// "Help me help groups like yours": what organizers struggle with, and whether
// they'd talk to Becca or connect with other organizers. For Becca only.
// Stored as short stable keys so the wording in copy.ts can change freely.

export const STRUGGLES = ["new_people", "marketing", "space", "tech", "admin", "money", "volunteers", "other"] as const;
export const CHAT = ["yes", "maybe", "no"] as const;
export const CONNECT = ["online", "in_person", "either", "no"] as const;
export const PROFILE = ["yes", "ask", "no"] as const;

export type Answers = {
  struggles: string[];
  struggleOther: string;
  handOff: string;
  chat: (typeof CHAT)[number] | null;
  connect: (typeof CONNECT)[number] | null;
  profile: (typeof PROFILE)[number] | null;
};

const MAX = 1000;
const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim().slice(0, MAX);
const oneOf = <T extends readonly string[]>(list: T, v: FormDataEntryValue | null): T[number] | null =>
  typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T[number]) : null;

export function readAnswers(form: FormData): Answers {
  const picked = new Set(form.getAll("struggles").map(String));
  return {
    struggles: STRUGGLES.filter((k) => picked.has(k)),
    struggleOther: text(form, "struggle_other"),
    handOff: text(form, "hand_off"),
    chat: oneOf(CHAT, form.get("chat")),
    connect: oneOf(CONNECT, form.get("connect")),
    profile: oneOf(PROFILE, form.get("profile")),
  };
}

export const isEmpty = (a: Answers) =>
  !a.struggles.length && !a.struggleOther && !a.handOff && !a.chat && !a.connect && !a.profile;

// Saves (or replaces) the answers that go with one submission.
export async function saveAnswers(
  db: D1Database,
  a: Answers,
  ctx: { orgId: string | null; personId: string; submissionId: string },
): Promise<void> {
  await db.batch([
    db.prepare("DELETE FROM org_answers WHERE submission_id = ?1").bind(ctx.submissionId),
    db
      .prepare(
        `INSERT INTO org_answers (id, org_id, person_id, submission_id, struggles, struggle_other, hand_off, chat, connect, profile)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
      )
      .bind(
        crypto.randomUUID(),
        ctx.orgId,
        ctx.personId,
        ctx.submissionId,
        JSON.stringify(a.struggles),
        a.struggleOther || null,
        a.handOff || null,
        a.chat,
        a.connect,
        a.profile,
      ),
  ]);
}

// The answers for a submission, if any (the thanks note mentions a "yes" to a chat).
export async function answersFor(db: D1Database, submissionId: string) {
  return db
    .prepare("SELECT chat FROM org_answers WHERE submission_id = ?1")
    .bind(submissionId)
    .first<{ chat: string | null }>();
}
