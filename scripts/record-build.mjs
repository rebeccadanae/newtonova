// Runs after a build passes (npm "postbuild"). On Cloudflare's builds only, it
// saves when this build read D1 (from fetch-from-d1.mjs) as a "built" row in
// `publishes`, so /admin can say how many edits aren't on the site yet.
// Local builds skip it, so they never count as a publish. (The deploy runs
// after this; if it ever fails, the next build corrects the count.)

import { readFileSync } from "node:fs";
import { d1, DATABASE } from "./d1.mjs";

const buildId = process.env.WORKERS_CI_BUILD_UUID;
if (!buildId) {
  console.log("record-build: not a Cloudflare build, nothing recorded");
  process.exit(0);
}

const readAt = readFileSync(new URL("../src/data/read-at.txt", import.meta.url), "utf8").trim();
// Both go straight into SQL, so check their shape first.
if (!/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/.test(readAt)) throw new Error(`record-build: odd read time "${readAt}"`);
if (!/^[\w-]+$/.test(buildId)) throw new Error(`record-build: odd build id "${buildId}"`);

// Only the admin count depends on this, so a failure warns instead of stopping the deploy.
try {
  d1("--remote", ["--command", `INSERT INTO publishes (kind, at, build_id) VALUES ('built', '${readAt}', '${buildId}')`]);
  console.log(`record-build: saved build ${buildId} (read D1 at ${readAt}) to ${DATABASE}`);
} catch (err) {
  console.warn(`record-build: couldn't save the build time, so /admin's count may be off\n${err.message}`);
}
