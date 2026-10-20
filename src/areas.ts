// Area order (for the area filter).
export const areas = [
  "Arlington",
  "Chantilly",
  "Fairfax",
  "Falls Church",
  "Manassas",
  "Reston",
  "Statewide",
  "National",
] as const;

// Groups in these areas are open to everyone, so they also show under any town.
export const wideAreas = ["Statewide", "National"];
