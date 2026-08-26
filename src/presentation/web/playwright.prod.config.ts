import { defineConfig } from "@playwright/test";

// Runs the same *.e2e.ts specs against an already-running production build
// (docker/dockerfile.prod, built and started directly with `docker build`/`docker run`
// -- see .github/workflows/ci.yml's e2e-prod job), instead of Playwright's own dev-mode
// webServer used by playwright.config.ts.
export default defineConfig({
  use: {
    baseURL: "http://localhost:3000",
  },
  testMatch: "**/*.e2e.{ts,js}",
});
