// "Add to calendar": a Google Calendar link (made in the browser) and .ics file
// text (made at build time, see src/pages/events/[id].ics.ts). Both use the same
// fields: name, dates, location (Where, else Area) and the event's Link.

import { addDays } from "./event-dates";

export type CalEvent = {
  id: string;
  name: string;
  start: string; // ISO with time, or "YYYY-MM-DD" when all-day
  end: string | null;
  allDay: boolean;
  link: string;
  location: string;
};

const TWO_HOURS = 2 * 60 * 60 * 1000;

// "2026-11-13T18:00:00.000-05:00" -> "20261113T230000Z"
const utc = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const dateOnly = (key: string) => key.replace(/-/g, "");

// Start and end in calendar format. No end time means two hours. All-day ends are
// exclusive in calendars, so the day after the last day.
function times(e: CalEvent) {
  if (e.allDay) {
    return { allDay: true, start: dateOnly(e.start), end: dateOnly(addDays(e.end ?? e.start, 1)) };
  }
  const start = Date.parse(e.start);
  const end = e.end ? Date.parse(e.end) : start + TWO_HOURS;
  return { allDay: false, start: utc(start), end: utc(end) };
}

export function googleUrl(e: CalEvent) {
  const t = times(e);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.name,
    dates: `${t.start}/${t.end}`,
    details: e.link,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export const icsPath = (e: Pick<CalEvent, "id">) => `/events/${e.id}.ics`;

// Friendly name for the downloaded file, e.g. "open-studio.ics".
export const icsFileName = (e: Pick<CalEvent, "name">) =>
  (e.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "event") + ".ics";

// iCalendar text escaping and 75-octet line folding (RFC 5545).
const escText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

function fold(line: string) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (size + n > (out.length ? 74 : 75)) {
      out.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out.join("\r\n ");
}

export function icsText(e: CalEvent, stamp = new Date()) {
  const t = times(e);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//newtonova.org//events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}@newtonova.org`,
    `DTSTAMP:${utc(stamp.getTime())}`,
    t.allDay ? `DTSTART;VALUE=DATE:${t.start}` : `DTSTART:${t.start}`,
    t.allDay ? `DTEND;VALUE=DATE:${t.end}` : `DTEND:${t.end}`,
    `SUMMARY:${escText(e.name)}`,
    e.location && `LOCATION:${escText(e.location)}`,
    e.link && `DESCRIPTION:${escText(e.link)}`,
    e.link && `URL:${e.link}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];
  return lines.map(fold).join("\r\n") + "\r\n";
}
