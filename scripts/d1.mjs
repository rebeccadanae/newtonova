// Runs SQL against the newtonova D1 database through wrangler.
// Locally, wrangler uses your `npx wrangler login`. On Cloudflare's build,
// it uses D1_API_TOKEN (a token limited to D1). It's not named
// CLOUDFLARE_API_TOKEN so it can't clash with the token the deploy uses.

import { execFileSync } from "node:child_process";

const ACCOUNT_ID = "8111aa9cebd70c8419581c65ca8cd1ef";

const env = { ...process.env, WRANGLER_SEND_METRICS: "false" };
if (process.env.D1_API_TOKEN) {
  env.CLOUDFLARE_API_TOKEN = process.env.D1_API_TOKEN;
  env.CLOUDFLARE_ACCOUNT_ID = ACCOUNT_ID;
}

// target: "--remote" (the real database) or "--local" (the test copy)
export function d1(target, args) {
  try {
    return execFileSync(
      "npx",
      ["wrangler", "d1", "execute", "newtonova", "--config", "db/wrangler.jsonc", target, ...args],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], env },
    );
  } catch (err) {
    throw new Error(`wrangler d1 failed:\n${err.stderr || err.stdout || err.message}`);
  }
}

export const query = (target, sql) => JSON.parse(d1(target, ["--json", "--command", sql]))[0].results;
