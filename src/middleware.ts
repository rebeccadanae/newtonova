// Runs on server-rendered requests only (public pages are static files).
// Everything under /admin needs a valid Cloudflare Access sign-in.
import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { checkAccess } from "./admin/access";

const isAdminPath = (path: string) => path === "/admin" || path.startsWith("/admin/");

export const onRequest = defineMiddleware(async (context, next) => {
  if (!isAdminPath(context.url.pathname)) return next();

  // Local `npm run dev` has no Access in front of it.
  if (import.meta.env.DEV) {
    context.locals.adminEmail = "local dev";
  } else {
    const user = await checkAccess(context.request, env.ACCESS_TEAM_DOMAIN, env.ACCESS_AUD);
    if (!user) {
      return new Response("Not allowed.", {
        status: 403,
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
      });
    }
    context.locals.adminEmail = user.email;
  }

  const response = await next();
  response.headers.set("cache-control", "no-store");
  response.headers.set("x-robots-tag", "noindex");
  return response;
});
