import { defineConfig } from "@playwright/test";

export default defineConfig({
  use: {
    // Relative paths in page.goto() and request.post() etc. resolve to this base.
    baseURL: "http://localhost:4173",
  },
  webServer: [
    {
      command: "npm run preview",
      port: 4173,
      // Reuse the server if it is already running (e.g. from a previous test run or `npm run preview`).
      reuseExistingServer: true,
    },
    // /api/guild/search now calls presentation-searchengine over Connect RPC (see
    // lib/server/search.ts), so it has to be up for that endpoint to answer 200.
    {
      command: "bun run dev",
      cwd: "../searchengine",
      port: Number(process.env.SEARCHENGINE_RPC_PORT ?? 8082),
      reuseExistingServer: true,
    },
  ],
  testMatch: "**/*.e2e.{ts,js}",
});
