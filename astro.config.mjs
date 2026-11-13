// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

// Pages are prerendered (static) unless a page sets `export const prerender = false`.
export default defineConfig({
  site: "https://newtonova.org",
  adapter: cloudflare({
    // Optimise images at build time, as before; no Cloudflare Images binding.
    imageService: "compile",
  }),
  // No Astro sessions, so no KV namespace gets created on deploy.
  session: false,
});
