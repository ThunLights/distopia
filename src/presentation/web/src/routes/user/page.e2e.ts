import { expect, test } from "@playwright/test";

// Protected /user routes — all require an authenticated session.
// Without an "authorization" cookie the layout server calls redirect(302, "/"),
// so Playwright lands on the home page after following the redirect.

test("/user redirects unauthenticated visitors to the home page", async ({ page }) => {
  await page.goto("/user");
  // Verify we ended up on the home page, not on an error page or /user.
  await expect(page.getByText("最近更新されたサーバー")).toBeVisible();
  expect(page.url()).not.toContain("/user");
});

test("/user/settings redirects unauthenticated visitors to the home page", async ({ page }) => {
  await page.goto("/user/settings");
  await expect(page.getByText("最近更新されたサーバー")).toBeVisible();
  expect(page.url()).not.toContain("/user");
});

test("deep guild-management path redirects unauthenticated visitors to home", async ({ page }) => {
  await page.goto("/user/guilds/000000000000000000");
  await expect(page.getByText("最近更新されたサーバー")).toBeVisible();
  expect(page.url()).not.toContain("/user");
});

test("the home page shown after redirect has the Login button", async ({ page }) => {
  await page.goto("/user");
  // Confirms we are on the unauthenticated home page, not some fallback error page.
  await expect(page.getByText("Login")).toBeVisible();
});
