// Group fields: reading them from a form, checking them, and saving to D1.
// Split in two so a future owner form can reuse the shared part:
//   - details: what an owner could also fill in
//   - admin-only: status, verified, found via, events page
import { categories } from "../categories";
import { routes } from "../routes";
import { wideAreas } from "../areas";

export const STATUSES = ["Live", "Ready", "Collecting", "Removed"] as const;
export const KINDS: string[] = categories.map((c) => c.name);

// Towns grouped as on the homepage signs, then the "anywhere" ones.
export const TOWN_GROUPS: { label: string; towns: string[] }[] = [
  ...routes.map((r) => ({ label: r.label, towns: r.towns })),
  { label: "Anywhere", towns: wideAreas },
];
export const TOWNS: string[] = TOWN_GROUPS.flatMap((g) => g.towns);

export type GroupDetails = {
  name: string;
  website: string;
  blurb: string;
  category: string[];
  area: string[];
  schedule: string;
  cost: string;
  accessibility: string;
  ages: string;
  first_time: string;
  where_text: string;
  no_fixed_place: boolean;
};

export type GroupAdmin = {
  status: string;
  verified: boolean;
  found_via: string;
  events_page: string;
};

export type Group = GroupDetails & GroupAdmin;
export type Errors = Partial<Record<keyof Group, string>>;

export const emptyGroup = (): Group => ({
  name: "", website: "", blurb: "", category: [], area: [],
  schedule: "", cost: "", accessibility: "", ages: "", first_time: "",
  where_text: "", no_fixed_place: false,
  status: "Collecting", verified: false, found_via: "", events_page: "",
});

// A row from the orgs table, as the form shows it.
export type OrgRow = {
  id: string;
  name: string;
  website: string | null;
  blurb: string | null;
  category: string;
  area: string;
  status: string;
  verified: number;
  found_via: string | null;
  events_page: string | null;
  where_text: string | null;
  no_fixed_place: number;
  schedule: string | null;
  cost: string | null;
  accessibility: string | null;
  ages: string | null;
  first_time: string | null;
  updated_at: string;
};

export const fromRow = (r: OrgRow): Group => ({
  name: r.name,
  website: r.website ?? "",
  blurb: r.blurb ?? "",
  category: JSON.parse(r.category),
  area: JSON.parse(r.area),
  schedule: r.schedule ?? "",
  cost: r.cost ?? "",
  accessibility: r.accessibility ?? "",
  ages: r.ages ?? "",
  first_time: r.first_time ?? "",
  where_text: r.where_text ?? "",
  no_fixed_place: !!r.no_fixed_place,
  status: r.status,
  verified: !!r.verified,
  found_via: r.found_via ?? "",
  events_page: r.events_page ?? "",
});

const SHORT = 200;
const LONG = 4000;

const str = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
};
const isUrl = (s: string) => {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

// Reads and checks the details part. `keep` lets values already on a group
// stay valid even if they've since dropped off the lists.
export function readDetails(form: FormData, keep?: { category: string[]; area: string[] }) {
  const errors: Errors = {};
  const allowed = (list: string[], kept: string[] = []) => new Set([...list, ...kept]);
  const kinds = allowed(KINDS, keep?.category);
  const towns = allowed(TOWNS, keep?.area);

  const values: GroupDetails = {
    name: str(form, "name"),
    website: str(form, "website"),
    blurb: str(form, "blurb"),
    // Keep the lists' own order, whatever order the browser sends.
    category: [...new Set(form.getAll("category").map(String))],
    area: [...new Set(form.getAll("area").map(String))],
    schedule: str(form, "schedule"),
    cost: str(form, "cost"),
    accessibility: str(form, "accessibility"),
    ages: str(form, "ages"),
    first_time: str(form, "first_time"),
    where_text: str(form, "where_text"),
    no_fixed_place: form.get("no_fixed_place") === "on",
  };

  if (!values.name) errors.name = "Give the group a name.";
  else if (values.name.length > SHORT) errors.name = `Keep the name under ${SHORT} characters.`;
  if (values.website && !isUrl(values.website)) errors.website = "Use a full web address starting with https://";
  if (values.category.some((k) => !kinds.has(k))) errors.category = "Pick kinds from the list.";
  if (values.area.some((t) => !towns.has(t))) errors.area = "Pick towns from the list.";
  for (const key of ["blurb", "first_time", "accessibility"] as const) {
    if (values[key].length > LONG) errors[key] = `Keep this under ${LONG} characters.`;
  }
  for (const key of ["schedule", "cost", "ages", "where_text"] as const) {
    if (values[key].length > SHORT * 2) errors[key] = `Keep this under ${SHORT * 2} characters.`;
  }

  return { values, errors };
}

export function readAdmin(form: FormData) {
  const errors: Errors = {};
  const values: GroupAdmin = {
    status: str(form, "status"),
    verified: form.get("verified") === "on",
    found_via: str(form, "found_via"),
    events_page: str(form, "events_page"),
  };
  if (!(STATUSES as readonly string[]).includes(values.status)) errors.status = "Pick a status.";
  if (values.found_via && !isUrl(values.found_via)) errors.found_via = "Use a full web address starting with https://";
  if (values.events_page.length > LONG) errors.events_page = `Keep this under ${LONG} characters.`;
  return { values, errors };
}

// Sorts picked kinds and towns into the lists' order, unknown kept ones last.
const ordered = (picked: string[], order: string[]) =>
  [...picked].sort((a, b) => (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999));

// Saves a group. id null makes a new one. Returns the id.
export async function saveGroup(db: D1Database, id: string | null, g: Group): Promise<string> {
  const now = new Date().toISOString();
  const row = {
    name: g.name,
    website: g.website || null,
    blurb: g.blurb || null,
    category: JSON.stringify(ordered(g.category, KINDS)),
    area: JSON.stringify(ordered(g.area, TOWNS)),
    status: g.status,
    verified: g.verified ? 1 : 0,
    found_via: g.found_via || null,
    events_page: g.events_page || null,
    where_text: g.where_text || null,
    no_fixed_place: g.no_fixed_place ? 1 : 0,
    schedule: g.schedule || null,
    cost: g.cost || null,
    accessibility: g.accessibility || null,
    ages: g.ages || null,
    first_time: g.first_time || null,
    updated_at: now,
  };
  const cols = Object.keys(row);
  const vals = Object.values(row);

  if (id) {
    const set = cols.map((c, i) => `${c} = ?${i + 1}`).join(", ");
    const res = await db.prepare(`UPDATE orgs SET ${set} WHERE id = ?${cols.length + 1}`).bind(...vals, id).run();
    if (!res.meta.changes) throw new Error("That group no longer exists.");
    return id;
  }

  // Same shape as Notion page ids, so links and the Tally prefill work unchanged.
  const newId = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO orgs (id, ${cols.join(", ")}, created_at) VALUES (?1, ${cols.map((_, i) => `?${i + 2}`).join(", ")}, ?${cols.length + 2})`,
    )
    .bind(newId, ...vals, now)
    .run();
  return newId;
}
