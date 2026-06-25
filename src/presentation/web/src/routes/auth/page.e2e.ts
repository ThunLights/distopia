import { expect, test } from "@playwright/test";

// Auth callback page (/auth)
// The server load returns { user: null } when the required OAuth2 params (code, state,
// session_key cookie) are absent or mismatched, so the page always shows failure here.

test("shows the failure message when accessed without valid OAuth params", async ({ page }) => {
  await page.goto("/auth");
  // Use exact:true because the description <p> also contains "認証に失敗しました。" ("Authentication failed.")
  // as a prefix; without exact the locator resolves to 2 elements and strict-mode rejects it.
  await expect(page.getByText("認証に失敗しました。", { exact: true })).toBeVisible();
});

test("shows the redirect countdown text", async ({ page }) => {
  await page.goto("/auth");
  // The template renders "認証に失敗しました。数秒後にリダイレクトされます。"
  // ("Authentication failed. You will be redirected in a few seconds.")
  await expect(page.getByText(/数秒後にリダイレクトされます/)).toBeVisible();
});

test("page title reflects the failure state", async ({ page }) => {
  await page.goto("/auth");
  await expect(page).toHaveTitle(/認証に失敗しました。 \/ Discordサーバー用掲示板/);
});

test("missing only the code param still returns failure", async ({ page }) => {
  await page.goto("/auth?state=some-state");
  await expect(page.getByText("認証に失敗しました。", { exact: true })).toBeVisible();
});

test("missing only the state param still returns failure", async ({ page }) => {
  await page.goto("/auth?code=some-code");
  await expect(page.getByText("認証に失敗しました。", { exact: true })).toBeVisible();
});
