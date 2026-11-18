import { expect, test } from "vitest";
import { countAnswers, inviteEmail } from "./invite-email";
import type { Answers } from "./answers";

const group = { name: "Sketch Club", area: ["Arlington"], category: ["Creative"], blurb: "word ".repeat(60).trim() };

test("inviteEmail fills name, link and a short blurb", () => {
  const { subject, body } = inviteEmail(group, "Sam", "https://newtonova.org/yours/abc");
  expect(subject).toBe("Sketch Club is on new to nova");
  expect(body).toContain("Hi Sam,");
  expect(body).toContain("https://newtonova.org/yours/abc");
  expect(body).toContain("Arlington · Creative");
  expect(body).toContain("…");
});

test("inviteEmail says hi there with no first name, and keeps a short blurb whole", () => {
  const { body } = inviteEmail({ ...group, blurb: "Weekly drawing." }, "", "https://x.test/yours/abc");
  expect(body).toContain("Hi there,");
  expect(body).toContain('"Weekly drawing."');
  expect(body).not.toContain("…");
});

test("the blurb is cut on a word boundary", () => {
  const { body } = inviteEmail(group, "Sam", "https://x.test/yours/abc");
  const quoted = body.split("\n").find((l) => l.trim().startsWith('"'))!;
  expect(quoted).toMatch(/word…"$/);
});

const a = (over: Partial<Answers>): Answers => ({
  struggles: [], struggleOther: "", handOff: "", chat: null, connect: null, profile: null, ...over,
});

test("countAnswers counts each key", () => {
  expect(countAnswers([a({ struggles: ["space"], chat: "yes" }), a({ struggles: ["space", "tech"] })])).toMatchObject({
    "struggles.space": 2,
    "struggles.tech": 1,
    "chat.yes": 1,
  });
});
