// Admin: the Publish button in the admin bar posts here. It starts a rebuild
// of the public pages through the Deploy Hook, then goes back to the page it
// came from, where the bar says it's publishing (or that it failed).
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { requestPublish, safeBack } from "../../admin/publish";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const back = safeBack(String(form.get("back") ?? ""));
  const hook = (env as unknown as { DEPLOY_HOOK_URL?: string }).DEPLOY_HOOK_URL;
  const ok = await requestPublish(env.DB, hook);
  if (ok) return redirect(back, 303);
  const url = new URL(back, "http://x");
  url.searchParams.set("publish", "failed");
  return redirect(url.pathname + url.search, 303);
};
