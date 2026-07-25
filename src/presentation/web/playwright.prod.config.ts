import { defineConfig } from "@playwright/test";

// Runs the same *.e2e.ts specs against an already-running production build
// (docker-compose.prod.yml, started via environment/production.sh), instead
// of Playwright's own dev-mode webServer used by playwright.config.ts.
export default defineConfig({
  use: {
    baseURL: "http://localhost:3000",
  },
  testMatch: "**/*.e2e.{ts,js}",
});
