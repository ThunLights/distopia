import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    // Relative paths in page.goto() and request.post() etc. resolve to this base.
    baseURL: "http://localhost:4173",
  },
  webServer: {
    command: "npm run build && npm run preview",
    port: 4173,
    // Reuse the server if it is already running (e.g. from a previous test run or `npm run preview`).
    reuseExistingServer: true,
  },
  testMatch: "**/*.e2e.{ts,js}",
});
