declare namespace App {
  interface Locals {
    /** Email of the signed-in admin, set by src/middleware.ts on /admin. */
    adminEmail?: string;
  }
}
