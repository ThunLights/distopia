import { expect, test } from "@playwright/test";

// Friends page (/friends)

test("has the correct page title", async ({ page }) => {
  await page.goto("/friends");
  await expect(page).toHaveTitle(/フレンド募集 \/ Discordサーバー用掲示板/);
});

test("renders without a server error", async ({ page }) => {
  const response = await page.goto("/friends");
  expect(response?.status()).toBe(200);
});
