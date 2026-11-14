// Event fields: reading them from a form, checking them, and saving to D1.
// Dates are stored the way Notion gave them, so the build and .ics need no changes:
//   all day: "2026-11-17"     timed: "2026-11-17T19:00:00.000-05:00" (New York offset)
import { KINDS, STATUSES, TOWNS } from "./groups";
import { nyParts, TZ } from "../event-dates";

export type EventForm = {
  name: string;
  link: string;
  org_id: string; // "" = no group
  area: string[];
  where_text: string;
  category: string; // "" = none
  summary: string;
  status: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:MM" or "" for all day
  end_date: string;
  end_time: string;
};

export type EventErrors = Partial<Record<keyof EventForm, string>>;

export type EventRow = {
  id: string;
  name: string;
  start: string;
  end: string | null;
  all_day: number;
  link: string | null;
  org_id: string | null;
  area: string;
  where_text: string | null;
  category: string | null;
  summary: string | null;
  status: string;
  updated_at: string;
};

export const emptyEvent = (): EventForm => ({
  name: "", link: "", org_id: "", area: [], where_text: "", category: "", summary: "",
  status: "Live", date: "", start_time: "", end_date: "", end_time: "",
});

// "2026-11-17" → { day, time: "" }; a timed value → its New York day and time.
export function splitStored(value: string | null) {
  if (!value) return { day: "", time: "" };
  if (!value.includes("T")) return { day: value, time: "" };
  return nyParts(new Date(value));
}

export function fromRow(r: EventRow): EventForm {
  const start = splitStored(r.start);
  const end = splitStored(r.end);
  return {
    name: r.name,
    link: r.link ?? "",
    org_id: r.org_id ?? "",
    area: JSON.parse(r.area),
    where_text: r.where_text ?? "",
    category: r.category ?? "",
    summary: r.summary ?? "",
    status: r.status,
    date: start.day,
    start_time: r.all_day ? "" : start.time,
    // An end on the same day as the start only needs its time.
    end_date: end.day && end.day !== start.day ? end.day : "",
    end_time: end.time,
  };
}

const offsetFmt = new Intl.DateTimeFormat("en-US", { timeZone: TZ, timeZoneName: "longOffset" });

// New York's UTC offset ("-05:00" or "-04:00") at a local day and time.
export function nyOffset(day: string, time: string) {
  // Guess with standard time, then read the real offset at that moment.
  const guess = new Date(`${day}T${time}:00-05:00`);
  const name = offsetFmt.formatToParts(guess).find((p) => p.type === "timeZoneName")?.value ?? "GMT-05:00";
  return name === "GMT" ? "+00:00" : name.replace("GMT", "");
}

export const toStored = (day: string, time: string) =>
  time ? `${day}T${time}:00.000${nyOffset(day, time)}` : day;

const LONG = 4000;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

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
const isDay = (s: string) => DAY.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);

// orgIds: every group id, so a posted group must exist.
// keep: towns or kind already on the event, kept valid if they've left the lists.
export function readEvent(form: FormData, orgIds: Set<string>, keep?: { area: string[]; category: string }) {
  const errors: EventErrors = {};
  const towns = new Set([...TOWNS, ...(keep?.area ?? [])]);
  const kinds = new Set([...KINDS, ...(keep?.category ? [keep.category] : [])]);

  const values: EventForm = {
    name: str(form, "name"),
    link: str(form, "link"),
    org_id: str(form, "org_id"),
    area: [...new Set(form.getAll("area").map(String))],
    where_text: str(form, "where_text"),
    category: str(form, "category"),
    summary: str(form, "summary"),
    status: str(form, "status"),
    date: str(form, "date"),
    start_time: str(form, "start_time"),
    end_date: str(form, "end_date"),
    end_time: str(form, "end_time"),
  };

  if (!values.name) errors.name = "Give the event a name.";
  else if (values.name.length > 200) errors.name = "Keep the name under 200 characters.";
  if (values.link && !isUrl(values.link)) errors.link = "Use a full web address starting with https://";
  if (values.org_id && !orgIds.has(values.org_id)) errors.org_id = "Pick a group from the list.";
  if (values.area.some((t) => !towns.has(t))) errors.area = "Pick towns from the list.";
  if (values.category && !kinds.has(values.category)) errors.category = "Pick a kind from the list.";
  if (!(STATUSES as readonly string[]).includes(values.status)) errors.status = "Pick a status.";
  if (values.where_text.length > 400) errors.where_text = "Keep this under 400 characters.";
  if (values.summary.length > LONG) errors.summary = `Keep this under ${LONG} characters.`;

  // When
  if (!values.date) errors.date = "Pick a date.";
  else if (!isDay(values.date)) errors.date = "Use a real date.";
  if (values.start_time && !TIME.test(values.start_time)) errors.start_time = "Use a time like 19:00.";
  if (values.end_date && !isDay(values.end_date)) errors.end_date = "Use a real date.";
  if (values.end_time && !TIME.test(values.end_time)) errors.end_time = "Use a time like 21:00.";
  if (!values.start_time && values.end_time) errors.end_time = "Add a start time too, or leave both empty for all day.";
  if (values.start_time && values.end_date && !values.end_time) errors.end_time = "Add an end time for the end date.";

  if (!errors.date && !errors.start_time && !errors.end_date && !errors.end_time) {
    const { start, end } = storedTimes(values);
    if (end && Date.parse(end.length === 10 ? `${end}T00:00:00Z` : end) < Date.parse(start.length === 10 ? `${start}T00:00:00Z` : start)) {
      errors[values.end_time ? "end_time" : "end_date"] = "The end is before the start.";
    }
  }

  return { values, errors };
}

// The start and end as stored. A timed end with no end date is on the start's day.
export function storedTimes(v: EventForm) {
  const start = toStored(v.date, v.start_time);
  let end: string | null = null;
  if (v.start_time && v.end_time) end = toStored(v.end_date || v.date, v.end_time);
  else if (!v.start_time && v.end_date && v.end_date !== v.date) end = v.end_date;
  return { start, end };
}

const ordered = (picked: string[], order: string[]) =>
  [...picked].sort((a, b) => (order.indexOf(a) + 1 || 999) - (order.indexOf(b) + 1 || 999));

// Saves an event. id null makes a new one. Returns the id.
export async function saveEvent(db: D1Database, id: string | null, v: EventForm): Promise<string> {
  const now = new Date().toISOString();
  const { start, end } = storedTimes(v);
  const row = {
    name: v.name,
    start,
    end,
    all_day: v.start_time ? 0 : 1,
    link: v.link || null,
    org_id: v.org_id || null,
    area: JSON.stringify(ordered(v.area, TOWNS)),
    where_text: v.where_text || null,
    category: v.category || null,
    summary: v.summary || null,
    status: v.status,
    updated_at: now,
  };
  const cols = Object.keys(row);
  const quoted = cols.map((c) => `"${c}"`);
  const vals = Object.values(row);

  if (id) {
    const set = quoted.map((c, i) => `${c} = ?${i + 1}`).join(", ");
    const res = await db.prepare(`UPDATE events SET ${set} WHERE id = ?${cols.length + 1}`).bind(...vals, id).run();
    if (!res.meta.changes) throw new Error("That event no longer exists.");
    return id;
  }

  const newId = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO events (id, ${quoted.join(", ")}, created_at) VALUES (?1, ${cols.map((_, i) => `?${i + 2}`).join(", ")}, ?${cols.length + 2})`,
    )
    .bind(newId, ...vals, now)
    .run();
  return newId;
}
