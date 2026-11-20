// Shared by the flyer component (src/components/Flyer.astro) and the pages that use it.

export type FlyerOrg = {
  id: string;
  name: string;
  website: string;
  category: string[];
  area: string[];
  blurb: string;
  /** Marked verified in admin: its tab reads "Update it" instead of "Verify it". */
  verified?: boolean;
  /** When its organizer last confirmed it (ISO), or empty: shows the confirmed line. */
  verifiedAt?: string;
};

// One of a group's next events, as the flyer's Next tab shows it.
export type NextEvent = { name: string; start: string; end: string | null; allDay: boolean; link: string; when: string };

// Slight, repeatable tilts and pin colours so the board looks hand-pinned.
export const tilts = [-1.4, 0.8, -0.4, 1.3, -0.9, 0.3, 1.0, -1.1];
export const pins = ["#E2402F", "#1F6FD1", "#1E9E57", "#F2B705", "#7A4FD6"];
