// /admin Publish bar: start a rebuild of the public pages, and say how many
// edits aren't on the site yet. A rebuild is started by POSTing to the
// Worker's Deploy Hook (the DEPLOY_HOOK_URL secret). Builds record when they
// read D1 (scripts/record-build.mjs), so anything edited after that is waiting.

export type PublishRow = { kind: "requested" | "built"; at: string };

export type PublishState =
  | { kind: "off" } // no Deploy Hook here (local dev without one)
  | { kind: "publishing"; since: string } // pressed, build not finished yet
  | { kind: "waiting"; edits: number; lastBuilt: string | null }
  | { kind: "upToDate"; lastBuilt: string };

// A build takes about 2 minutes. After this long, stop saying "publishing"
// and go back to counting (the build probably failed).
const PUBLISHING_FOR_MS = 15 * 60 * 1000;

export function describePublish(opts: {
  hook: boolean;
  lastRequested: string | null;
  lastBuilt: string | null;
  edits: number;
  now: Date;
}): PublishState {
  const { hook, lastRequested, lastBuilt, edits, now } = opts;
  if (!hook) return { kind: "off" };
  // The build's `at` is when it read D1, which is after the press it answers.
  const pressedSinceBuild = lastRequested && (!lastBuilt || lastRequested > lastBuilt);
  if (pressedSinceBuild && now.getTime() - Date.parse(lastRequested) < PUBLISHING_FOR_MS) {
    return { kind: "publishing", since: lastRequested };
  }
  if (lastBuilt && edits === 0) return { kind: "upToDate", lastBuilt };
  return { kind: "waiting", edits, lastBuilt };
}

export async function publishState(db: D1Database, hookUrl: string | undefined, now = new Date()): Promise<PublishState> {
  const { results } = await db
    .prepare("SELECT kind, MAX(at) AS at FROM publishes GROUP BY kind")
    .all<PublishRow>();
  const lastRequested = results.find((r) => r.kind === "requested")?.at ?? null;
  const lastBuilt = results.find((r) => r.kind === "built")?.at ?? null;
  // Groups and events saved after the last build read D1. With no build on
  // record (local dev), every row would count, so say nothing.
  let edits = 0;
  if (lastBuilt) {
    const row = await db
      .prepare(
        `SELECT (SELECT COUNT(*) FROM orgs WHERE updated_at > ?1) + (SELECT COUNT(*) FROM events WHERE updated_at > ?1) AS n`,
      )
      .bind(lastBuilt)
      .first<{ n: number }>();
    edits = row?.n ?? 0;
  }
  return describePublish({ hook: Boolean(hookUrl), lastRequested, lastBuilt, edits, now });
}

// Starts a rebuild. Records the press only if Cloudflare accepted it.
export async function requestPublish(db: D1Database, hookUrl: string | undefined): Promise<boolean> {
  if (!hookUrl) return false;
  try {
    const res = await fetch(hookUrl, { method: "POST" });
    if (!res.ok) {
      console.error(`publish: Deploy Hook answered ${res.status}`);
      return false;
    }
  } catch (err) {
    console.error("publish: Deploy Hook failed", err);
    return false;
  }
  await db.prepare("INSERT INTO publishes (kind, at) VALUES ('requested', ?1)").bind(new Date().toISOString()).run();
  return true;
}

// Where to go back to after pressing Publish: only somewhere inside /admin.
export function safeBack(back: string): string {
  return /^\/admin(\/[^\s\\]*)?(\?[^\s\\]*)?$/.test(back) && !back.startsWith("//") ? back : "/admin/";
}
