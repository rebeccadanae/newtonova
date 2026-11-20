import { expect, test } from "vitest";
import { describePublish, safeBack } from "./publish";

const now = new Date("2026-11-20T15:00:00.000Z");
const base = { hook: true, lastRequested: null, lastBuilt: null, edits: 0, now };

test("no Deploy Hook means publishing is off", () => {
  expect(describePublish({ ...base, hook: false, edits: 3 })).toEqual({ kind: "off" });
});

test("pressed after the last build, a few minutes ago: publishing", () => {
  expect(
    describePublish({ ...base, lastBuilt: "2026-11-20T09:00:00.000Z", lastRequested: "2026-11-20T14:58:00.000Z", edits: 2 }),
  ).toEqual({ kind: "publishing", since: "2026-11-20T14:58:00.000Z" });
});

test("a build after the press means it finished", () => {
  expect(
    describePublish({ ...base, lastRequested: "2026-11-20T14:50:00.000Z", lastBuilt: "2026-11-20T14:51:00.000Z" }),
  ).toEqual({ kind: "upToDate", lastBuilt: "2026-11-20T14:51:00.000Z" });
});

test("a press with no build after 15 minutes goes back to counting", () => {
  expect(
    describePublish({ ...base, lastBuilt: "2026-11-20T09:00:00.000Z", lastRequested: "2026-11-20T14:30:00.000Z", edits: 2 }),
  ).toEqual({ kind: "waiting", edits: 2, lastBuilt: "2026-11-20T09:00:00.000Z" });
});

test("edits since the last build are waiting", () => {
  expect(describePublish({ ...base, lastBuilt: "2026-11-20T09:00:00.000Z", edits: 1 })).toEqual({
    kind: "waiting",
    edits: 1,
    lastBuilt: "2026-11-20T09:00:00.000Z",
  });
});

test("no build on record: waiting, with no count to trust", () => {
  expect(describePublish(base)).toEqual({ kind: "waiting", edits: 0, lastBuilt: null });
});

test("safeBack keeps admin paths and refuses anything else", () => {
  expect(safeBack("/admin/events/?q=run")).toBe("/admin/events/?q=run");
  expect(safeBack("/admin")).toBe("/admin");
  expect(safeBack("https://evil.example/admin/")).toBe("/admin/");
  expect(safeBack("//evil.example")).toBe("/admin/");
  expect(safeBack("/administrator")).toBe("/admin/");
  expect(safeBack("/")).toBe("/admin/");
});
