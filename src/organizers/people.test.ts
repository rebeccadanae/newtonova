import { expect, test } from "vitest";
import { readPersonEdit, readWho } from "./people";

const form = (fields: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
};

test("readWho trims and lowercases email", () => {
  const { values } = readWho(form({ who_name: " Sam ", who_email: " Sam@X.com " }), { emailKnown: false });
  expect(values).toMatchObject({ name: "Sam", email: "sam@x.com" });
});

test("readWho needs email only when not known", () => {
  const f = form({ who_name: "Sam" });
  expect(readWho(f, { emailKnown: false }).errors.email).toBeTruthy();
  expect(readWho(f, { emailKnown: true }).errors.email).toBeUndefined();
});

test("readWho needs a name", () => {
  expect(readWho(form({ who_email: "sam@x.com" }), { emailKnown: false }).errors.name).toBeTruthy();
});

test("readWho rejects an address without a domain", () => {
  expect(readWho(form({ who_name: "Sam", who_email: "sam@x" }), { emailKnown: false }).errors.email).toBeTruthy();
  expect(readWho(form({ who_name: "Sam", who_email: "sam.x.com" }), { emailKnown: false }).errors.email).toBeTruthy();
});

test("a different email typed over a known one is still checked", () => {
  expect(readWho(form({ who_name: "Sam", who_email: "nope" }), { emailKnown: true }).errors.email).toBeTruthy();
});

test("readPersonEdit cleans a corrected name and email", () => {
  const { values, error } = readPersonEdit(form({ name: " Sam ", email: " Sam@Example.org ", role: " Organizer " }));
  expect(error).toBe("");
  expect(values).toEqual({ name: "Sam", email: "sam@example.org", role: "Organizer" });
});

test("readPersonEdit still catches a typo in the email", () => {
  expect(readPersonEdit(form({ name: "Sam", email: "sam@example" })).error).toBe("bad-email");
  expect(readPersonEdit(form({ name: "Sam", email: "" })).error).toBe("bad-email");
});

test("readPersonEdit needs a name", () => {
  expect(readPersonEdit(form({ name: " ", email: "sam@example.org" })).error).toBe("bad-name");
});
