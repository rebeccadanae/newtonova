// Repeating events. A rule makes one ordinary event per date, all sharing a
// series id, so the public pages and .ics files see plain events.
import { addDays, weekday } from "../event-dates";
import { fromRow, insertStatement, updateStatement, splitStored, type EventForm, type EventRow } from "./events";

export const RULES = ["weekly", "biweekly", "monthly", "monthly-last"] as const;
export type Rule = (typeof RULES)[number];
export const isRule = (s: string): s is Rule => (RULES as readonly string[]).includes(s);

export const MAX_MONTHS = 12;
export const DEFAULT_MONTHS = 3;

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORDINAL = ["1st", "2nd", "3rd", "4th"];

const parts = (key: string) => key.split("-").map(Number) as [number, number, number];
const key = (y: number, m: number, d: number) => {
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toISOString().slice(0, 10);
};
const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

// The same day of the month, `months` later (clamped to the month's last day).
export function addMonths(day: string, months: number) {
  const [y, m, d] = parts(day);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const ty = target.getUTCFullYear();
  const tm = target.getUTCMonth() + 1;
  return key(ty, tm, Math.min(d, daysInMonth(ty, tm)));
}

export const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

// Which weekday of the month a day is: { n: 3, last: false, weekday: 2 } for a 3rd Tuesday.
export function placeInMonth(day: string) {
  const [y, m, d] = parts(day);
  return { n: Math.ceil(d / 7), last: d + 7 > daysInMonth(y, m), weekday: weekday(day) };
}

// "Every week on Tuesday", "Monthly on the 3rd Tuesday", ...
export function ruleLabel(rule: Rule, day: string) {
  const p = placeInMonth(day);
  const name = DAYS[p.weekday];
  if (rule === "weekly") return `Every week on ${name}`;
  if (rule === "biweekly") return `Every 2 weeks on ${name}`;
  if (rule === "monthly") return p.n <= 4 ? `Monthly on the ${ORDINAL[p.n - 1]} ${name}` : `Monthly on the 5th ${name}`;
  return `Monthly on the last ${name}`;
}

// Why a rule can't start on this day, or "" if it can.
export function ruleProblem(rule: Rule, day: string) {
  const p = placeInMonth(day);
  if (rule === "monthly" && p.n > 4) return "Not every month has a 5th one. Pick “last” instead.";
  if (rule === "monthly-last" && !p.last) return "That date isn't the last one of its kind in the month.";
  return "";
}

// Every date for the rule from `first` (included) through `until`.
export function datesFor(first: string, rule: Rule, until: string): string[] {
  const out: string[] = [];
  if (rule === "weekly" || rule === "biweekly") {
    const step = rule === "weekly" ? 7 : 14;
    for (let d = first; d <= until; d = addDays(d, step)) out.push(d);
    return out;
  }
  const { n, weekday: wd } = placeInMonth(first);
  const [y0, m0] = parts(first);
  for (let i = 0; ; i++) {
    const at = new Date(Date.UTC(y0, m0 - 1 + i, 1));
    const y = at.getUTCFullYear();
    const m = at.getUTCMonth() + 1;
    const firstWd = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    let d: number;
    if (rule === "monthly") {
      d = 1 + ((wd - firstWd + 7) % 7) + 7 * (n - 1);
    } else {
      const dim = daysInMonth(y, m);
      const lastWd = new Date(Date.UTC(y, m - 1, dim)).getUTCDay();
      d = dim - ((lastWd - wd + 7) % 7);
    }
    const day = key(y, m, d);
    if (day > until) break;
    if (day >= first) out.push(day);
  }
  return out;
}

// The form's values moved to another day, keeping times and how many days it lasts.
export function onDay(v: EventForm, day: string): EventForm {
  const span = v.end_date ? daysBetween(v.date, v.end_date) : 0;
  return { ...v, date: day, end_date: v.end_date ? addDays(day, span) : "" };
}

export type SeriesRow = { id: string; repeat: Rule; until: string };

export type SeriesInfo = SeriesRow & { count: number; first: string; last: string };

export async function seriesInfo(db: D1Database, seriesId: string): Promise<SeriesInfo | null> {
  const s = await db.prepare("SELECT id, repeat, until FROM series WHERE id = ?1").bind(seriesId).first<SeriesRow>();
  if (!s) return null;
  const r = await db
    .prepare(
      `SELECT COUNT(*) AS count, MIN(substr(start, 1, 10)) AS first, MAX(substr(start, 1, 10)) AS last
       FROM events WHERE series_id = ?1 AND status != 'Removed'`,
    )
    .bind(seriesId)
    .first<{ count: number; first: string | null; last: string | null }>();
  return { ...s, count: r?.count ?? 0, first: r?.first ?? "", last: r?.last ?? "" };
}

// Makes a new series: one event per date. Returns its id and how many were made.
export async function createSeries(db: D1Database, v: EventForm, rule: Rule, until: string) {
  const now = new Date().toISOString();
  const seriesId = crypto.randomUUID();
  const dates = datesFor(v.date, rule, until);
  await db.batch([
    db.prepare("INSERT INTO series (id, repeat, until, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?4)").bind(seriesId, rule, until, now),
    ...dates.map((day) => insertStatement(db, crypto.randomUUID(), onDay(v, day), now, seriesId)),
  ]);
  return { seriesId, count: dates.length };
}

// Checks a repeat choice from the new-event form. Returns the rule and end day, or an error.
export function readRepeat(form: FormData, date: string) {
  const repeat = String(form.get("repeat") ?? "none");
  const untilRaw = String(form.get("until") ?? "").trim();
  if (repeat === "none" || !date) return { rule: null, until: "", error: "" };
  if (!isRule(repeat)) return { rule: null, until: untilRaw, error: "Pick how it repeats." };
  const problem = ruleProblem(repeat, date);
  if (problem) return { rule: repeat, until: untilRaw, error: problem };
  return { rule: repeat, ...checkUntil(untilRaw || addMonths(date, DEFAULT_MONTHS), date, addMonths(date, MAX_MONTHS)) };
}

// An end day for repeats: a real date, after `after`, no later than `latest`.
export function checkUntil(until: string, after: string, latest: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(until) || Number.isNaN(Date.parse(`${until}T00:00:00Z`)))
    return { until, error: "Use a real date." };
  if (until <= after) return { until, error: "Pick a date after the first one." };
  if (until > latest) return { until, error: `Repeats can run at most ${MAX_MONTHS} months ahead.` };
  return { until, error: "" };
}

// Saves this event, and copies every field but the date to the later ones in its series.
// Each later event keeps its own day; times and length follow the form. Returns how many changed.
export async function saveFromHereOn(db: D1Database, event: EventRow, v: EventForm) {
  const now = new Date().toISOString();
  const fromDay = splitStored(event.start).day;
  const { results: later } = await db
    .prepare("SELECT id, start FROM events WHERE series_id = ?1 AND id != ?2 AND substr(start, 1, 10) >= ?3")
    .bind(event.series_id, event.id, fromDay)
    .all<{ id: string; start: string }>();
  await db.batch([
    updateStatement(db, event.id, v, now),
    ...later.map((e) => updateStatement(db, e.id, onDay(v, splitStored(e.start).day), now)),
  ]);
  return later.length + 1;
}

// Adds dates after the series' latest event, up to `until`, copied from that event.
export async function extendSeries(db: D1Database, seriesId: string, until: string) {
  const s = await db.prepare("SELECT id, repeat, until FROM series WHERE id = ?1").bind(seriesId).first<SeriesRow>();
  if (!s) throw new Error("That series no longer exists.");
  const latest = await db
    .prepare("SELECT * FROM events WHERE series_id = ?1 ORDER BY substr(start, 1, 10) DESC LIMIT 1")
    .bind(seriesId)
    .first<EventRow>();
  if (!latest) throw new Error("That series has no events left.");

  const template = fromRow(latest);
  const dates = datesFor(template.date, s.repeat, until).slice(1);
  const now = new Date().toISOString();
  await db.batch([
    db.prepare("UPDATE series SET until = ?1, updated_at = ?2 WHERE id = ?3").bind(until, now, seriesId),
    ...dates.map((day) => insertStatement(db, crypto.randomUUID(), { ...onDay(template, day), status: "Live" }, now, seriesId)),
  ]);
  return dates.length;
}
