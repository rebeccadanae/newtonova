// Date helpers for /events. Everything is worked out in New York time, whatever
// the visitor's own time zone. Days are passed around as "YYYY-MM-DD" keys.

export const TZ = "America/New_York";

const partsFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// The New York day ("2026-11-14") and time ("19:00") of a moment.
export function nyParts(d: Date) {
  const p = Object.fromEntries(partsFmt.formatToParts(d).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

export const todayKey = () => nyParts(new Date()).day;

// Calendar maths on day keys, done in UTC so daylight saving never shifts a day.
const toUTC = (key: string) => new Date(`${key}T00:00:00Z`);
const fromUTC = (d: Date) => d.toISOString().slice(0, 10);

export const addDays = (key: string, n: number) => {
  const d = toUTC(key);
  d.setUTCDate(d.getUTCDate() + n);
  return fromUTC(d);
};

// 0 = Sunday ... 6 = Saturday
export const weekday = (key: string) => toUTC(key).getUTCDay();

// Monday of the week the day falls in.
export const mondayOf = (key: string) => addDays(key, -((weekday(key) + 6) % 7));

const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" });

// "Saturday 14 November"
export const dayLabel = (key: string) => dayFmt.format(toUTC(key)).replace(",", "");

// "11 to 15 November", or "30 November to 6 December"
export function rangeLabel(from: string, to: string) {
  const a = toUTC(from);
  const b = toUTC(to);
  const sameMonth = a.getUTCMonth() === b.getUTCMonth();
  return sameMonth
    ? `${a.getUTCDate()} to ${b.getUTCDate()} ${monthFmt.format(b)}`
    : `${a.getUTCDate()} ${monthFmt.format(a)} to ${b.getUTCDate()} ${monthFmt.format(b)}`;
}

// "November 2026"
const monthYearFmt = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
export const monthTitle = (key: string) => monthYearFmt.format(toUTC(key));

// First day of the month `offset` months after the one `key` is in.
export function monthStart(key: string, offset = 0) {
  const d = toUTC(key);
  return fromUTC(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1)));
}

// "6pm", "6:30pm" for the month grid's chips.
export const shortTime = (iso: string) => timeLabel(iso).replace(":00", "").replace(" ", "");

const timeFmt =new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" });

// "7:00 pm"
export const timeLabel = (iso: string) => timeFmt.format(new Date(iso)).replace(/\s?([AP])M$/, (_, m) => ` ${m.toLowerCase()}m`);
