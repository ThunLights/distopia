import { expect, test } from "@playwright/test";

// Help pages (/help, /help/rate, /help/register)

test("/help has the correct page title", async ({ page }) => {
  await page.goto("/help");
  await expect(page).toHaveTitle(/Help \/ Discordサーバー用掲示板/);
});

test("/help renders without a server error", async ({ page }) => {
  const response = await page.goto("/help");
  expect(response?.status()).toBe(200);
});

test("/help/rate renders without a server error", async ({ page }) => {
  const response = await page.goto("/help/rate");
  expect(response?.status()).toBe(200);
});

test("/help/register renders without a server error", async ({ page }) => {
  const response = await page.goto("/help/register");
  expect(response?.status()).toBe(200);
});
