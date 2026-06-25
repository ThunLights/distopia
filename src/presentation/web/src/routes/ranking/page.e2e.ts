import { expect, test, type Page } from "@playwright/test";

// ── Fixtures ──────────────────────────────────────────────────────────────────

// Matches GuildRanking / UserRanking from $lib/shared/types/routes/api/ranking
type GuildRanking = {
  guildId: string;
  name: string;
  activeRate: number | null;
  level: number;
  point: number;
  memberCount: number | null;
  onlineMemberCount: number | null;
  iconUrl: string | null;
};

type UserRanking = {
  id: string;
  displayName: string;
  username: string;
  bumpCounter: number | null;
  avatarUrl?: string;
};

const GUILD_LEVEL_1: GuildRanking = {
  guildId: "100000000000000001",
  name: "Level Leader Guild",
  activeRate: 95,
  level: 42,
  point: 100,
  memberCount: 500,
  onlineMemberCount: 120,
  iconUrl: null,
};

const GUILD_LEVEL_2: GuildRanking = {
  guildId: "100000000000000002",
  name: "Second Level Guild",
  activeRate: 80,
  level: 30,
  point: 50,
  memberCount: 200,
  onlineMemberCount: 40,
  iconUrl: null,
};

const GUILD_ACTIVE_1: GuildRanking = {
  guildId: "200000000000000001",
  name: "Active Rate Champion",
  activeRate: 100,
  level: 10,
  point: 50,
  memberCount: 200,
  onlineMemberCount: 80,
  iconUrl: null,
};

const USER_BUMP_1: UserRanking = {
  id: "300000000000000001",
  displayName: "Top Bumper",
  username: "topbumper_user",
  bumpCounter: 999,
};

const USER_BUMP_2: UserRanking = {
  id: "300000000000000002",
  displayName: "Second Bumper",
  username: "second_bumper",
  bumpCounter: 500,
};

const FULL_RANKING = {
  guild: {
    level: [GUILD_LEVEL_1, GUILD_LEVEL_2],
    activeRate: [GUILD_ACTIVE_1],
  },
  user: {
    bump: [USER_BUMP_1, USER_BUMP_2],
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Intercept GET /api/ranking and respond with the given ranking data. */
async function mockRanking(page: Page, data = FULL_RANKING) {
  await page.route("**/api/ranking", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
}

// ── Page-level rendering (no mock) ───────────────────────────────────────────

test("has the correct page title", async ({ page }) => {
  await page.goto("/ranking");
  await expect(page).toHaveTitle(/サーバーランキング \/ Discordサーバー用掲示板/);
});

test("renders the ランキング heading", async ({ page }) => {
  await page.goto("/ranking");
  // getByText("ランキング") ("Ranking") without scope matches 3 elements: the header nav link,
  // the page heading, and the "ユーザーBumpランキング" ("User Bump Ranking") option (partial match).
  // Scope to <main> and use exact:true to target only the page heading.
  await expect(page.locator("main").getByText("ランキング", { exact: true })).toBeVisible();
});

test("dropdown contains all three ranking-type options", async ({ page }) => {
  await page.goto("/ranking");
  const select = page.locator("select");
  await expect(select.locator("option[value='level']")).toBeAttached();
  await expect(select.locator("option[value='rate']")).toBeAttached();
  await expect(select.locator("option[value='userbump']")).toBeAttached();
});

test("defaults to 'rate' when no ?t param is given", async ({ page }) => {
  await page.goto("/ranking");
  await expect(page.locator("select")).toHaveValue("rate");
});

test("an unknown ?t value falls back to 'rate'", async ({ page }) => {
  await page.goto("/ranking?t=unknown");
  await expect(page.locator("select")).toHaveValue("rate");
});

// ── Active rate tab (default) ─────────────────────────────────────────────────

test("active-rate ranking entries appear by default", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking");

  // Guild.svelte renders: "{index+1}: {name}"
  await expect(page.getByText("1: Active Rate Champion")).toBeVisible();
});

test("active-rate entry shows rate, level, and points", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking");

  // Guild.svelte template has a line-break between "Lv.{level}" and "{point}pt",
  // so the raw text content contains \n+whitespace — use \s+ to match it.
  await expect(page.getByText(/Rate 100 Lv\.10\s+50pt/)).toBeVisible();
});

test("active-rate entry shows member counts", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking");

  // Expected format: "{memberCount}人(アクティブ: {onlineMemberCount})" — member/online counts in Japanese
  await expect(page.getByText(/200人.*アクティブ.*80/)).toBeVisible();
});

test("active-rate guild entry has a link to the guild detail page", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking");

  // Guild.svelte renders a "詳細→" ("Detail →") link
  const link = page.getByRole("link", { name: "詳細→" }).first();
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("href", `/guilds/${GUILD_ACTIVE_1.guildId}`);
});

// ── Level tab ────────────────────────────────────────────────────────────────

test("switching to level tab shows level-ranked guilds", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking");
  await page.locator("select").selectOption("level");

  await expect(page.getByText("1: Level Leader Guild")).toBeVisible();
  await expect(page.getByText("2: Second Level Guild")).toBeVisible();
});

test("level entry shows level and points", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking");
  await page.locator("select").selectOption("level");

  // Same template line-break issue as activeRate — use \s+ between Lv.42 and 100pt.
  await expect(page.getByText(/Rate 95 Lv\.42\s+100pt/)).toBeVisible();
});

test("?t=level pre-selects the level tab and shows level data immediately", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking?t=level");

  await expect(page.locator("select")).toHaveValue("level");
  await expect(page.getByText("1: Level Leader Guild")).toBeVisible();
});

// ── Userbump tab ──────────────────────────────────────────────────────────────

test("switching to userbump tab shows user rankings", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking");
  await page.locator("select").selectOption("userbump");

  // User.svelte renders: "{index+1}: {displayName}"
  await expect(page.getByText("1: Top Bumper")).toBeVisible();
  await expect(page.getByText("2: Second Bumper")).toBeVisible();
});

test("userbump entry shows the username and Discord ID", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking");
  await page.locator("select").selectOption("userbump");

  // Expected text: "ユーザーネーム: {username} (ID: {id})" — "username" label in Japanese
  await expect(page.getByText(/ユーザーネーム: topbumper_user/)).toBeVisible();
  await expect(page.getByText(/ID: 300000000000000001/)).toBeVisible();
});

test("userbump entry shows the bump count in the children slot", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking");
  await page.locator("select").selectOption("userbump");

  // ranking/+page.svelte injects a snippet: <p>合計: {bumpCounter}回</p> ("Total: N times" in Japanese)
  await expect(page.getByText("合計: 999回")).toBeVisible();
  await expect(page.getByText("合計: 500回")).toBeVisible();
});

test("?t=userbump pre-selects the userbump tab and shows user data immediately", async ({
  page,
}) => {
  await mockRanking(page);
  await page.goto("/ranking?t=userbump");

  await expect(page.locator("select")).toHaveValue("userbump");
  await expect(page.getByText("1: Top Bumper")).toBeVisible();
});

// ── Switching between tabs ─────────────────────────────────────────────────────

test("switching tabs hides the previous tab's content", async ({ page }) => {
  await mockRanking(page);
  await page.goto("/ranking");

  // Default: active-rate content is shown
  await expect(page.getByText("1: Active Rate Champion")).toBeVisible();

  // Switch to level
  await page.locator("select").selectOption("level");
  await expect(page.getByText("1: Level Leader Guild")).toBeVisible();
  await expect(page.getByText("1: Active Rate Champion")).not.toBeVisible();

  // Switch to userbump
  await page.locator("select").selectOption("userbump");
  await expect(page.getByText("1: Top Bumper")).toBeVisible();
  await expect(page.getByText("1: Level Leader Guild")).not.toBeVisible();
});

// ── Edge cases ────────────────────────────────────────────────────────────────

test("all empty ranking arrays render without a crash", async ({ page }) => {
  await mockRanking(page, { guild: { level: [], activeRate: [] }, user: { bump: [] } });
  await page.goto("/ranking");

  await expect(page.locator("select")).toBeVisible();
  await page.locator("select").selectOption("level");
  await page.locator("select").selectOption("userbump");
  // Page should still be usable with empty data — same scoped locator as the heading test.
  await expect(page.locator("main").getByText("ランキング", { exact: true })).toBeVisible();
});
