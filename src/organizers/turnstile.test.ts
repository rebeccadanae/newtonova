import { describe, expect, it } from "vitest";
import { verifyTurnstile } from "./turnstile";

const reply = (body: unknown, ok = true) => (async () => new Response(JSON.stringify(body), { status: ok ? 200 : 500 })) as unknown as typeof fetch;

describe("verifyTurnstile", () => {
  it("passes when Cloudflare says success", async () => {
    expect(await verifyTurnstile("tok", "secret", "1.2.3.4", reply({ success: true }))).toBe(true);
  });
  it("fails when Cloudflare says no", async () => {
    expect(await verifyTurnstile("tok", "secret", null, reply({ success: false }))).toBe(false);
  });
  it("fails with no secret or no token, without asking", async () => {
    const never = (async () => { throw new Error("should not be called"); }) as unknown as typeof fetch;
    expect(await verifyTurnstile("tok", "", null, never)).toBe(false);
    expect(await verifyTurnstile("", "secret", null, never)).toBe(false);
  });
  it("fails on a server or network error", async () => {
    expect(await verifyTurnstile("tok", "secret", null, reply({}, false))).toBe(false);
    const broken = (async () => { throw new Error("offline"); }) as unknown as typeof fetch;
    expect(await verifyTurnstile("tok", "secret", null, broken)).toBe(false);
  });
});
