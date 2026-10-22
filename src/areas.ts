// Area order (for the area filter).
export const areas = [
  "Alexandria",
  "Annandale",
  "Arlington",
  "Ashburn",
  "Centreville",
  "Chantilly",
  "Fairfax",
  "Falls Church",
  "Herndon",
  "Lorton",
  "Manassas",
  "McLean",
  "Reston",
  "Woodbridge",
  "Statewide",
  "National",
] as const;

// Groups in these areas are open to everyone, so they also show under any town.
export const wideAreas = ["Statewide", "National"];
