declare namespace App {
  interface Locals {
    /** Email of the signed-in admin, set by src/middleware.ts on /admin. */
    adminEmail?: string;
  }
}

/** True in staging builds (CLOUDFLARE_ENV=staging); set in astro.config.mjs. */
declare const __STAGING__: boolean;
