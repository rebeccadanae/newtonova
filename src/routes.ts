// Route groups for "Where are you headed?" on the homepage.
// Each group's colour also marks place everywhere on the site (flyers, Coming up dots).
// Towns listed here must match Notion's Area options. Statewide and National are "anywhere".

export type Route = {
  id: string;
  label: string;
  shield: "interstate" | "virginia";
  number: string;
  color: string;
  towns: string[];
};

export const routes: Route[] = [
  {
    id: "beltway",
    label: "Inside the Beltway",
    shield: "interstate",
    number: "495",
    color: "#FF8E72",
    towns: ["Arlington", "Alexandria", "Falls Church", "McLean", "Annandale"],
  },
  {
    id: "i66",
    label: "I-66 West",
    shield: "interstate",
    number: "66",
    color: "#F6D44A",
    towns: ["Fairfax", "Clifton", "Centreville", "Manassas"],
  },
  {
    id: "dulles",
    label: "Dulles Toll Road",
    shield: "virginia",
    number: "267",
    color: "#93D26C",
    towns: ["Reston", "Herndon", "Ashburn", "Chantilly"],
  },
  {
    id: "i95",
    label: "I-95 South",
    shield: "interstate",
    number: "95",
    color: "#F7A9CB",
    towns: ["Lorton", "Woodbridge"],
  },
];

// Colour for groups that are Statewide or National, spread across three or more
// route groups, or have no area.
export const anywhereColor = "#D7B6F4";

// The route group a group's first listed town belongs to.
export const routeFor = (areas: string[]) => {
  for (const a of areas) {
    const r = routes.find((r) => r.towns.includes(a));
    if (r) return r;
  }
  return undefined;
};

// How many route groups a group's towns cover.
const routesCovered = (areas: string[]) => routes.filter((r) => areas.some((a) => r.towns.includes(a))).length;

export const placeColor = (areas: string[]) =>
  routesCovered(areas) >= 3 ? anywhereColor : (routeFor(areas)?.color ?? anywhereColor);
