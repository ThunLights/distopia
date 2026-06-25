import { expect, test } from "@playwright/test";

// Static informational pages — verify each page renders with HTTP 200 and a
// recognisable title so we catch routing or SSR-crash regressions early.

test("/about has the correct page title", async ({ page }) => {
  await page.goto("/about");
  await expect(page).toHaveTitle(/Distopiaについて \/ Discordサーバー用掲示板/);
});

test("/privacy renders without a server error", async ({ page }) => {
  const response = await page.goto("/privacy");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Discordサーバー用掲示板/);
});

test("/terms renders without a server error", async ({ page }) => {
  const response = await page.goto("/terms");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Discordサーバー用掲示板/);
});

test("/guideline renders without a server error", async ({ page }) => {
  const response = await page.goto("/guideline");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Discordサーバー用掲示板/);
});

test("/other renders without a server error", async ({ page }) => {
  const response = await page.goto("/other");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Discordサーバー用掲示板/);
});

test("/supporter renders without a server error", async ({ page }) => {
  const response = await page.goto("/supporter");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Discordサーバー用掲示板/);
});
