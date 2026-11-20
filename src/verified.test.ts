import { describe, expect, it } from "vitest";
import { confirmedMonth } from "./verified";

describe("confirmedMonth", () => {
  it("gives the month and year", () => {
    expect(confirmedMonth("2026-11-19T15:00:00.000Z")).toBe("Nov 2026");
  });

  it("uses New York time at the turn of a month", () => {
    // 1 December, 2am UTC is still 30 November in New York.
    expect(confirmedMonth("2026-12-01T02:00:00.000Z")).toBe("Nov 2026");
  });

  it("is empty with no date or a bad one", () => {
    expect(confirmedMonth(null)).toBe("");
    expect(confirmedMonth("")).toBe("");
    expect(confirmedMonth("not a date")).toBe("");
  });
});
