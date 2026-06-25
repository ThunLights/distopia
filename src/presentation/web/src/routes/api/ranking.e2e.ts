import { expect, test } from "@playwright/test";

// GET /api/ranking
//
// Returns 200 + { guild: { level, activeRate }, user: { bump } }.
// No authentication required.

const ENDPOINT = "/api/ranking";

test("GET returns 200", async ({ request }) => {
  const res = await request.get(ENDPOINT);
  expect(res.status()).toBe(200);
});

test("response contains the expected top-level shape", async ({ request }) => {
  const res = await request.get(ENDPOINT);
  const body = await res.json();
  // guild rankings
  expect(body).toHaveProperty("guild");
  expect(Array.isArray(body.guild.level)).toBe(true);
  expect(Array.isArray(body.guild.activeRate)).toBe(true);
  // user rankings
  expect(body).toHaveProperty("user");
  expect(Array.isArray(body.user.bump)).toBe(true);
});

test("guild level entries have the required fields when data exists", async ({ request }) => {
  const res = await request.get(ENDPOINT);
  const body = await res.json();
  for (const entry of body.guild.level) {
    // Fields defined in ResponseMethodGet / GuildRanking
    expect(typeof entry.guildId).toBe("string");
    expect(typeof entry.level).toBe("number");
    expect(typeof entry.point).toBe("number");
  }
});

test("user bump entries have the required fields when data exists", async ({ request }) => {
  const res = await request.get(ENDPOINT);
  const body = await res.json();
  for (const entry of body.user.bump) {
    expect(typeof entry.id).toBe("string");
    expect(typeof entry.username).toBe("string");
  }
});

test("POST method is not allowed (405)", async ({ request }) => {
  const res = await request.post(ENDPOINT, { data: {} });
  expect(res.status()).toBe(405);
});
