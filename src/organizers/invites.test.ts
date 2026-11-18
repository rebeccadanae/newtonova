import { expect, test } from "vitest";
import { newCode } from "./invites";

test("newCode is 22 url-safe characters and differs each time", () => {
  const a = newCode();
  const b = newCode();
  expect(a).toMatch(/^[A-Za-z0-9_-]{22}$/);
  expect(a).not.toBe(b);
});
