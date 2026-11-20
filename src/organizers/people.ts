// Organizers: reading "who's sending this" from a form, and saving the person.
// Name and email live only in D1 (people). Never on the site or in the JSON.

export type Who = { name: string; email: string; role: string };
export type WhoErrors = Partial<Record<keyof Who, string>>;

const MAX = 200;
const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// Field names carry a who_ prefix so they can share a form with the group's own
// fields (the group's name is "name").
// emailKnown: the invite already has an email, so the field may be left empty
// (an address typed there still replaces it, and is still checked).
export function readWho(form: FormData, opts: { emailKnown: boolean }) {
  const values: Who = {
    name: str(form, "who_name"),
    email: str(form, "who_email").toLowerCase(),
    role: str(form, "who_role"),
  };
  const errors: WhoErrors = {};
  if (!values.name) errors.name = "Tell me your name.";
  else if (values.name.length > MAX) errors.name = `Keep your name under ${MAX} characters.`;
  if (!values.email) {
    if (!opts.emailKnown) errors.email = "Add an email so I can reply.";
  } else if (!looksLikeEmail(values.email) || values.email.length > MAX) {
    errors.email = "That email doesn't look right. Check for a typo.";
  }
  if (values.role.length > MAX) errors.role = `Keep this under ${MAX} characters.`;
  return { values, errors };
}

// Finds the person by email (any case) or adds them. Updates the name if it changed.
export async function savePerson(db: D1Database, who: { name: string; email: string }): Promise<string> {
  const email = who.email.trim().toLowerCase();
  const now = new Date().toISOString();
  const found = await db.prepare("SELECT id, name FROM people WHERE email = ?1").bind(email).first<{ id: string; name: string }>();
  if (found) {
    if (who.name && who.name !== found.name) {
      await db.prepare("UPDATE people SET name = ?1, updated_at = ?2 WHERE id = ?3").bind(who.name, now, found.id).run();
    }
    return found.id;
  }
  const id = crypto.randomUUID();
  await db
    .prepare("INSERT INTO people (id, name, email, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)")
    .bind(id, who.name, email, now)
    .run();
  return id;
}

// Links a person to a group. Keeps an existing link; fills in the role if one is given.
export async function linkPerson(db: D1Database, orgId: string, personId: string, role: string): Promise<void> {
  await db
    .prepare(
      `INSERT INTO org_people (org_id, person_id, role) VALUES (?1, ?2, ?3)
       ON CONFLICT (org_id, person_id) DO UPDATE SET role = COALESCE(excluded.role, org_people.role)`,
    )
    .bind(orgId, personId, role || null)
    .run();
}

// Admin: correcting a linked organizer (a typo in their name or email, or their
// role with one group). Returns the cleaned values, or the first problem.
export type PersonEdit = { name: string; email: string; role: string };
export function readPersonEdit(form: FormData): { values: PersonEdit; error: "" | "bad-name" | "bad-email" } {
  const values: PersonEdit = {
    name: str(form, "name").slice(0, MAX),
    email: str(form, "email").toLowerCase(),
    role: str(form, "role").slice(0, MAX),
  };
  if (!values.name) return { values, error: "bad-name" };
  if (!looksLikeEmail(values.email) || values.email.length > MAX) return { values, error: "bad-email" };
  return { values, error: "" };
}
