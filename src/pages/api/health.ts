// A tiny server-rendered check that the Worker can reach D1.
// Shows only counts of Live rows, nothing private.
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

export const GET: APIRoute = async () => {
  const row = await env.DB.prepare(
    "SELECT (SELECT COUNT(*) FROM orgs WHERE status = 'Live') AS groups, (SELECT COUNT(*) FROM events WHERE status = 'Live') AS events",
  ).first<{ groups: number; events: number }>();
  return Response.json({ ok: true, ...row }, { headers: { "cache-control": "no-store" } });
};
