import { expect, test } from "vitest";
import { isEmpty, readAnswers } from "./answers";

test("readAnswers keeps only known keys", () => {
  const f = new FormData();
  f.append("struggles", "space");
  f.append("struggles", "hack");
  f.set("chat", "maybe");
  f.set("connect", "sideways");
  expect(readAnswers(f)).toMatchObject({ struggles: ["space"], chat: "maybe", connect: null, profile: null });
});

test("readAnswers trims and caps the text answers", () => {
  const f = new FormData();
  f.set("hand_off", `  ${"x".repeat(1200)}  `);
  f.set("struggle_other", "  Parking  ");
  const a = readAnswers(f);
  expect(a.handOff.length).toBe(1000);
  expect(a.struggleOther).toBe("Parking");
});

test("isEmpty is true for an untouched form", () => {
  expect(isEmpty(readAnswers(new FormData()))).toBe(true);
});

test("isEmpty is false once anything is answered", () => {
  const f = new FormData();
  f.set("profile", "ask");
  expect(isEmpty(readAnswers(f))).toBe(false);
});

test("the same struggle picked twice counts once", () => {
  const f = new FormData();
  f.append("struggles", "tech");
  f.append("struggles", "tech");
  expect(readAnswers(f).struggles).toEqual(["tech"]);
});
