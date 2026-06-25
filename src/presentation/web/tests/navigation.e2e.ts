import { expect, test } from "@playwright/test";

// ── Header navigation ─────────────────────────────────────────────────────────

test("header title 'Distopia' links back to the home page", async ({ page }) => {
  await page.goto("/staff");
  // The header title is rendered as a link with text "Distopia"
  await page.getByRole("link", { name: "Distopia" }).click();
  await expect(page).toHaveURL("/");
  await expect(page).toHaveTitle(/Home \/ Discordサーバー用掲示板/);
});

// The "ホーム" ("Home") link in the header uses `style="display: none"` by default on desktop
// (it is only revealed when the hamburger menu is open, unlike the other nav links which
// use an empty inline style and remain visible via CSS).  Testing it via a click is
// therefore not meaningful; navigating home via the title link is already tested above.

test("ランキング nav link navigates to /ranking", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "ランキング" }).click();
  await expect(page).toHaveURL(/\/ranking/);
  await expect(page).toHaveTitle(/サーバーランキング/);
});

test("フレンド募集 nav link navigates to /friends", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "フレンド募集" }).click();
  await expect(page).toHaveURL(/\/friends/);
  await expect(page).toHaveTitle(/フレンド募集/);
});

test("ヘルプ nav link navigates to /help", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "ヘルプ" }).click();
  await expect(page).toHaveURL(/\/help/);
  await expect(page).toHaveTitle(/Help/);
});

test("その他 nav link navigates to /other", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "その他" }).click();
  await expect(page).toHaveURL(/\/other/);
});

// ── Login flow ────────────────────────────────────────────────────────────────

test("Login button initiates the Discord OAuth2 redirect", async ({ page }) => {
  await page.goto("/");

  // Abort external navigation so the test stays on localhost.
  await page.route(/discord\.com\/oauth2/, async (route) => {
    await route.abort();
  });

  // waitForRequest resolves as soon as the browser sends the request (before abort).
  const [discordRequest] = await Promise.all([
    page.waitForRequest(/discord\.com\/oauth2\/authorize/),
    page.getByText("Login").click(),
  ]);

  expect(discordRequest.url()).toContain("discord.com/oauth2/authorize");
  expect(discordRequest.url()).toContain("client_id=");
});

test("Login button navigates through /login before reaching Discord", async ({ page }) => {
  await page.goto("/");

  // Record all navigations until we abort at Discord.
  const visitedPaths: string[] = [];
  page.on("request", (req) => {
    if (req.resourceType() === "document") {
      visitedPaths.push(new URL(req.url()).pathname);
    }
  });
  await page.route(/discord\.com\/oauth2/, async (route) => {
    await route.abort();
  });

  await Promise.all([
    page.waitForRequest(/discord\.com\/oauth2\/authorize/),
    page.getByText("Login").click(),
  ]);

  // /login is the intermediate SvelteKit server endpoint
  expect(visitedPaths).toContain("/login");
});

// ── Footer navigation ──────────────────────────────────────────────────────────

test("footer 'Official Discord Server' link points to a discord.gg invite", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Official Discord Server" });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", /discord\.gg/);
});

test("footer 'Team ThunLights' link points to thunlights.com", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Team ThunLights" });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", "https://www.thunlights.com");
});

// ── Page title changes on navigation ─────────────────────────────────────────

test("page title updates correctly as the user navigates between pages", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Home \/ Discordサーバー用掲示板/);

  await page.goto("/ranking");
  await expect(page).toHaveTitle(/サーバーランキング/);

  await page.goto("/help");
  await expect(page).toHaveTitle(/Help/);

  await page.goto("/staff");
  await expect(page).toHaveTitle(/スタッフ情報/);

  await page.goto("/about");
  await expect(page).toHaveTitle(/Distopiaについて/);
});

// ── Search-from-home navigation ───────────────────────────────────────────────

test("search input on the home page navigates to /search with the term in the URL", async ({
  page,
}) => {
  await page.goto("/");
  // Use an ASCII term to avoid URL-encoding ambiguity in the assertion
  // (the home page encodes the term with encodeURIComponent before placing it in ?w).
  await page.locator("#search-input").fill("discord");
  await page.locator("#search-input").press("Enter");
  await page.waitForURL(/\/search/);

  expect(page.url()).toContain("discord");
});

// ── Guild detail navigation from search results ───────────────────────────────

test("clicking 詳細 on a search result navigates to the guild detail page", async ({ page }) => {
  const GUILD_ID = "555555555555555555";

  // Mock the search API to return a single guild
  await page.route("**/api/guild/search", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        guilds: [
          {
            guildId: GUILD_ID,
            name: "Navigation Test Guild",
            invite: "navtest",
            description: "Used for navigation testing",
            tags: [],
            nsfw: false,
            boostCount: 0,
            iconUrl: null,
            rank: null,
          },
        ],
        count: 1,
        time: "0ms",
      }),
    });
  });

  await page.goto("/search?w=navigation");
  await expect(page.getByText("Navigation Test Guild")).toBeVisible();

  await page.getByRole("link", { name: "詳細" }).click();
  await page.waitForURL(`/guilds/${GUILD_ID}`);
  expect(page.url()).toContain(`/guilds/${GUILD_ID}`);
});

// ── 404 handling ──────────────────────────────────────────────────────────────

test("visiting a non-existent route returns a 404 response", async ({ page }) => {
  const res = await page.goto("/this-route-does-not-exist-12345");
  expect(res?.status()).toBe(404);
});

// ── Cache-control headers ─────────────────────────────────────────────────────

test("all page responses include no-store Cache-Control header", async ({ page }) => {
  // hooks.server.ts sets response.headers.set("Cache-Control", "no-store") on every response.
  const response = await page.goto("/");
  const cacheControl = response?.headers()["cache-control"];
  expect(cacheControl).toContain("no-store");
});
