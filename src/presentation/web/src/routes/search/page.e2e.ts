import { expect, test, type Page } from "@playwright/test";

// ── Fixtures ──────────────────────────────────────────────────────────────────

// Matches the Guild type from $lib/shared/types/routes/api/guild/search
type Guild = {
  guildId: string;
  name: string;
  invite: string;
  description: string | null;
  tags: string[];
  nsfw: boolean;
  boostCount: number;
  iconUrl: string | null;
  rank: number | null;
};

const GUILD_NORMAL: Guild = {
  guildId: "111111111111111111",
  name: "Alpha Gaming Guild",
  invite: "abcABC",
  description: "A place for serious gamers.",
  tags: ["gaming", "fps"],
  nsfw: false,
  boostCount: 5,
  iconUrl: null,
  rank: 1,
};

const GUILD_NSFW: Guild = {
  guildId: "222222222222222222",
  name: "Beta NSFW Community",
  invite: "xyzXYZ",
  description: null,
  tags: [],
  nsfw: true,
  boostCount: 0,
  iconUrl: null,
  rank: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Intercept POST /api/guild/search and respond with the given guilds. */
async function mockSearch(page: Page, guilds: Guild[]) {
  await page.route("**/api/guild/search", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ guilds, count: guilds.length, time: "0ms" }),
    });
  });
}

/** Intercept POST /api/guild/search and respond with a 400 error payload. */
async function mockSearchError(page: Page, content: string) {
  await page.route("**/api/guild/search", async (route) => {
    await route.fulfill({
      status: 400,
      contentType: "application/json",
      body: JSON.stringify({ content }),
    });
  });
}

// ── Page-level rendering (no mock) ───────────────────────────────────────────

test("renders without crash when no query param is given", async ({ page }) => {
  await page.goto("/search");
  await expect(page).toHaveTitle(/Discordサーバー用掲示板/);
});

test("pre-fills the search input from the ?w query parameter", async ({ page }) => {
  await page.goto("/search?w=hello");
  await expect(page.locator("#search-input")).toHaveValue("hello");
});

test("page title contains the decoded search term", async ({ page }) => {
  await page.goto("/search?w=myterm");
  await expect(page).toHaveTitle(/「myterm」の検索結果を表示/);
});

test("hit-count paragraph is always present", async ({ page }) => {
  await page.goto("/search");
  await expect(page.getByText(/件のサーバーがヒット/)).toBeVisible();
});

// ── Guild card rendering (mocked API) ─────────────────────────────────────────

test("guild cards appear for each result returned by the API", async ({ page }) => {
  await mockSearch(page, [GUILD_NORMAL, GUILD_NSFW]);
  await page.goto("/search?w=guild");

  await expect(page.getByText(GUILD_NORMAL.name)).toBeVisible();
  await expect(page.getByText(GUILD_NSFW.name)).toBeVisible();
});

test("hit count reflects the number of results returned", async ({ page }) => {
  await mockSearch(page, [GUILD_NORMAL, GUILD_NSFW]);
  await page.goto("/search?w=guild");

  await expect(page.getByText("2件のサーバーがヒット")).toBeVisible();
});

test("guild card shows the description", async ({ page }) => {
  await mockSearch(page, [GUILD_NORMAL]);
  await page.goto("/search?w=alpha");

  await expect(page.getByText(GUILD_NORMAL.description!)).toBeVisible();
});

test("guild card shows the boost count", async ({ page }) => {
  await mockSearch(page, [GUILD_NORMAL]);
  await page.goto("/search?w=alpha");

  await expect(page.getByText(`ブースト: ${GUILD_NORMAL.boostCount}`)).toBeVisible();
});

test("NSFW guild shows the NSFW!! badge", async ({ page }) => {
  await mockSearch(page, [GUILD_NSFW]);
  await page.goto("/search?w=nsfw");

  await expect(page.getByText("NSFW!!")).toBeVisible();
});

test("non-NSFW guild does not show the NSFW!! badge", async ({ page }) => {
  await mockSearch(page, [GUILD_NORMAL]);
  await page.goto("/search?w=alpha");

  // There should be no NSFW badge at all on the page.
  await expect(page.getByText("NSFW!!")).not.toBeVisible();
});

test("tags appear as links pointing to /search?w={tag}", async ({ page }) => {
  await mockSearch(page, [GUILD_NORMAL]);
  await page.goto("/search?w=alpha");

  // GUILD_NORMAL has tags ["gaming", "fps"]
  const gamingTag = page.getByRole("link", { name: "gaming" });
  await expect(gamingTag).toBeVisible();
  await expect(gamingTag).toHaveAttribute("href", /\/search\?w=gaming/);

  const fpsTag = page.getByRole("link", { name: "fps" });
  await expect(fpsTag).toBeVisible();
  await expect(fpsTag).toHaveAttribute("href", /\/search\?w=fps/);
});

test("詳細 button links to the guild detail page", async ({ page }) => {
  await mockSearch(page, [GUILD_NORMAL]);
  await page.goto("/search?w=alpha");

  const detailLink = page.getByRole("link", { name: "詳細" });
  await expect(detailLink).toBeVisible();
  await expect(detailLink).toHaveAttribute("href", `/guilds/${GUILD_NORMAL.guildId}`);
});

// ── Unauthenticated join behaviour ────────────────────────────────────────────

test("clicking サーバーに参加 when unauthenticated navigates to the Discord invite URL", async ({
  page,
}) => {
  await mockSearch(page, [GUILD_NORMAL]);

  // Intercept external navigation so the test browser does not leave localhost.
  let capturedUrl = "";
  await page.route(/discord\.gg/, async (route) => {
    capturedUrl = route.request().url();
    await route.abort();
  });

  await page.goto("/search?w=alpha");
  await expect(page.getByText(GUILD_NORMAL.name)).toBeVisible();

  // For unauthenticated users joinGuild() sets location.href = "https://discord.gg/{invite}"
  await page.getByText("サーバーに参加").click();
  await page.waitForTimeout(300);

  expect(capturedUrl).toContain(`discord.gg/${GUILD_NORMAL.invite}`);
});

// ── Empty and error states ─────────────────────────────────────────────────────

test("shows 0 hits when the API returns an empty guild array", async ({ page }) => {
  await mockSearch(page, []);
  await page.goto("/search?w=noresults");

  await expect(page.getByText("0件のサーバーがヒット")).toBeVisible();
  await expect(page.getByText(GUILD_NORMAL.name)).not.toBeVisible();
});

test("shows an error toast when the API returns 400", async ({ page }) => {
  await mockSearchError(page, "検索ワードが長すぎます");
  await page.goto("/search?w=toolong");

  // parseErrRes shows a toast formatted as: 'エラー「{content}」' ("Error: {content}" in Japanese)
  await expect(page.getByText(/エラー「検索ワードが長すぎます」/)).toBeVisible({
    timeout: 3000,
  });
});

// ── Dynamic search interaction ─────────────────────────────────────────────────

test("submitting a new term via Enter replaces the displayed results", async ({ page }) => {
  // Return different guilds depending on the search term
  await page.route("**/api/guild/search", async (route) => {
    const body = (await route.request().postDataJSON()) as { term: string };
    const guilds = body.term === "alpha" ? [GUILD_NORMAL] : [GUILD_NSFW];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ guilds, count: guilds.length, time: "0ms" }),
    });
  });

  await page.goto("/search?w=alpha");
  await expect(page.getByText(GUILD_NORMAL.name)).toBeVisible();

  await page.locator("#search-input").fill("nsfw");
  await page.locator("#search-input").press("Enter");

  await expect(page.getByText(GUILD_NSFW.name)).toBeVisible();
  await expect(page.getByText(GUILD_NORMAL.name)).not.toBeVisible();
});

test("the URL is updated with the new search term after Enter", async ({ page }) => {
  await mockSearch(page, []);
  await page.goto("/search?w=initial");

  await page.locator("#search-input").fill("updated");
  await page.locator("#search-input").press("Enter");

  await expect(page).toHaveURL(/updated/);
});

test("clicking a tag re-searches with the tag as the term", async ({ page }) => {
  await mockSearch(page, [GUILD_NORMAL]);
  await page.goto("/search?w=alpha");

  // getByText("gaming") also matches the guild name "Alpha Gaming Guild" (partial match),
  // causing a strict-mode violation. Use getByRole to target only the <a> tag element.
  const gamingLink = page.getByRole("link", { name: "gaming" });
  await expect(gamingLink).toBeVisible();

  // Clicking a tag navigates to /search?w=gaming (via href, not onMount search).
  // Wait for the URL to specifically contain "gaming" — waitForURL(/\/search/) would
  // match the current /search?w=alpha URL before the navigation finishes.
  await gamingLink.click();
  await page.waitForURL(/gaming/);
  expect(page.url()).toContain("gaming");
});
