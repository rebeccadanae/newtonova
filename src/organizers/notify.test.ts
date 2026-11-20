import { describe, expect, it, vi } from "vitest";
import { alertEmail, sendAlert, type AlertInput } from "./notify";

const base: AlertInput = {
  kind: "change",
  submissionId: "sub-123",
  groupName: "Fairfax Jubil-Aires",
  via: "public",
  who: { name: "Sam Rivera", role: "Organizer", email: "sam.private@example.test" },
  note: "Our rehearsal moved to Thursdays.",
  staging: false,
};

describe("alertEmail", () => {
  it("names the kind and the group in the subject", () => {
    expect(alertEmail(base).subject).toBe("Change to Fairfax Jubil-Aires");
    expect(alertEmail({ ...base, kind: "new" }).subject).toBe("New group: Fairfax Jubil-Aires");
    expect(alertEmail({ ...base, kind: "confirm" }).subject).toBe("Looks good: Fairfax Jubil-Aires");
    expect(alertEmail({ ...base, kind: "remove" }).subject).toBe("Take off: Fairfax Jubil-Aires");
  });

  it("says who sent it, how, their note, and links to To review", () => {
    const { text } = alertEmail(base);
    expect(text).toContain("Sent by: Sam Rivera (Organizer), on the public page");
    expect(text).toContain("Our rehearsal moved to Thursdays.");
    expect(text).toContain("https://newtonova.org/admin/review/sub-123");
  });

  it("never includes the organizer's email address", () => {
    const { subject, text } = alertEmail(base);
    expect(subject + text).not.toContain("sam.private");
    expect(subject + text).not.toContain("@");
  });

  it("shortens a long note", () => {
    const { text } = alertEmail({ ...base, note: "x".repeat(500) });
    expect(text).toContain("x".repeat(300) + "…");
    expect(text).not.toContain("x".repeat(301));
  });

  it("marks staging emails", () => {
    const { subject, text } = alertEmail({ ...base, staging: true });
    expect(subject).toBe("[staging] Change to Fairfax Jubil-Aires");
    expect(text).toContain("staging site");
  });
});

describe("sendAlert", () => {
  it("does nothing without an address", async () => {
    const send = vi.fn();
    await sendAlert({ send }, "", base);
    expect(send).not.toHaveBeenCalled();
  });

  it("never throws when sending fails", async () => {
    const send = vi.fn().mockRejectedValue(new Error("E_RECIPIENT_NOT_ALLOWED"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(sendAlert({ send }, "becca@example.test", base)).resolves.toBeUndefined();
    log.mockRestore();
  });
});
