import { expect, test } from "vitest";
import { readDetails } from "./groups";

test("readDetails requires a name and an https website", () => {
  const f = new FormData();
  f.set("website", "example.com");
  const { errors } = readDetails(f);
  expect(errors.name).toBeTruthy();
  expect(errors.website).toBeTruthy();
});

test("readDetails accepts a named group with a full web address", () => {
  const f = new FormData();
  f.set("name", " I Run, You Run ");
  f.set("website", "https://www.meetup.com/irunyourun/");
  const { values, errors } = readDetails(f);
  expect(errors).toEqual({});
  expect(values.name).toBe("I Run, You Run");
});
