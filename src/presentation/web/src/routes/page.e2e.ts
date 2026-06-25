import { expect, test } from "@playwright/test";

// Home page (/)

test("has the correct page title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Home \/ Discordサーバー用掲示板/);
});

test("shows the Login button for unauthenticated users", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Login")).toBeVisible();
});

test("renders the search input", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#search-input")).toBeVisible();
});

test("shows the latest-guilds section heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("最近更新されたサーバー")).toBeVisible();
});

test("shows the active-guilds section heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("アクティブなサーバー")).toBeVisible();
});

test("pressing Enter in the search box navigates to /search with the term", async ({ page }) => {
  await page.goto("/");
  await page.locator("#search-input").fill("playwright");
  await page.locator("#search-input").press("Enter");
  await page.waitForURL(/\/search/);
  expect(page.url()).toContain("/search");
  expect(page.url()).toContain("playwright");
});

test("clicking the search button navigates to /search", async ({ page }) => {
  await page.goto("/");
  await page.locator("#search-input").fill("button-click");
  // The search button is a <label> wrapping the search input; click the PrimaryButton text
  await page.getByText("検索").click();
  await page.waitForURL(/\/search/);
  expect(page.url()).toContain("/search");
});
