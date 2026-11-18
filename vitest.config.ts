// Unit tests for plain TypeScript helpers (form reading, checks, formatting).
// Pages and D1 queries are checked by hand against the local database.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
});
