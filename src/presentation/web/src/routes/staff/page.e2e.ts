import { test, expect } from "@playwright/test";

test("test staff", async ({ page }) => {
  await page.goto("/staff");
  await expect(page.getByText("ROBOT")).toBeVisible();
});
