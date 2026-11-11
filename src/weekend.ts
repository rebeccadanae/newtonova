// What "This weekend" means on /events. Change it here only.
// Days use JavaScript numbering: 0 = Sunday, 5 = Friday, 6 = Saturday.
// `from` is the New York time (24-hour "HH:MM") an event must reach on that day to count.
export const WEEKEND: { day: number; from: string }[] = [
  { day: 5, from: "17:00" }, // Friday evening
  { day: 6, from: "00:00" }, // Saturday
  { day: 0, from: "00:00" }, // Sunday
];
