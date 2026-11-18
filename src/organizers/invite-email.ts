// The outreach email Becca sends by hand (from /admin "Copy invite"), and the
// counts on /admin/answers. Wording is placeholder until Becca rewrites it.
import type { Answers } from "./answers";

const BLURB_MAX = 120;

// First ~120 characters of the blurb, cut at a word, with an ellipsis.
function shortBlurb(blurb: string): string {
  const b = blurb.trim().replace(/\s+/g, " ");
  if (b.length <= BLURB_MAX) return b;
  const cut = b.slice(0, BLURB_MAX);
  const space = cut.lastIndexOf(" ");
  return `${(space > 40 ? cut.slice(0, space) : cut).replace(/[\s,.;:]+$/, "")}…`;
}

export function inviteEmail(
  o: { name: string; area: string[]; category: string[]; blurb: string },
  firstName: string,
  link: string,
): { subject: string; body: string } {
  const meta = [o.area.join(", "), o.category.join(", ")].filter(Boolean).join(" · ");
  const lines = [
    `Hi ${firstName.trim() || "there"},`,
    "",
    `I'm Becca. I run new to nova, a free list of Northern Virginia groups that welcome new people. I added ${o.name} because [one line about why you added them].`,
    "",
    `  ${o.name}`,
    ...(meta ? [`  ${meta}`] : []),
    ...(o.blurb.trim() ? [`  "${shortBlurb(o.blurb)}"`] : []),
    "",
    `Check your listing (takes 2 minutes, no account needed):`,
    link,
    "",
    "You can fix anything that's off and tell me what would help your group. It's free, and always will be.",
    "",
    "Becca",
    "",
    "Not something you want? You can take it off the list from the same link. Or just reply. I read everything.",
  ];
  return { subject: `${o.name} is on new to nova`, body: lines.join("\n") };
}

// How many organizers picked each answer, keyed "struggles.space", "chat.yes", …
export function countAnswers(rows: Answers[]): Record<string, number> {
  const counts: Record<string, number> = {};
  const add = (key: string) => (counts[key] = (counts[key] ?? 0) + 1);
  for (const r of rows) {
    for (const s of r.struggles) add(`struggles.${s}`);
    if (r.chat) add(`chat.${r.chat}`);
    if (r.connect) add(`connect.${r.connect}`);
    if (r.profile) add(`profile.${r.profile}`);
  }
  return counts;
}
