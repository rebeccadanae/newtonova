// The month a group was last confirmed by its organizer, as the flyer shows it
// ("Nov 2026"), in New York time. Empty when there's no date.
export function confirmedMonth(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "America/New_York" });
}
