// Category order (for filter chips) and pill colors.
export const categories = [
  { name: "Creative", color: "#F6D9C9" },
  { name: "Sports & movement", color: "#CFE6D6" },
  { name: "Activism", color: "#D9DDF6" },
  { name: "Mutual aid", color: "#F5D0DC" },
  { name: "Learning", color: "#E2DAF2" },
  { name: "Social", color: "#F3E3A6" },
  { name: "Families", color: "#BFE3EA" },
  { name: "Religious", color: "#EFE6DA" },
  { name: "Volunteering", color: "#E5EDB8" },
] as const;

export const categoryColor = (name: string) =>
  categories.find((c) => c.name === name)?.color ?? "#EEEEEE";
