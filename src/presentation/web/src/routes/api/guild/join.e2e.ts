import { expect, test } from "@playwright/test";

// POST /api/guild/join
//
// Schema (PostBodySchema): guildId: z.string().regex(/^\d+$/)
//
// Handler uses authAndValidateHandler which processes in this order:
//   1. e.request.json() — parse body as JSON
//   2. schema.validate(body) — validate with Zod
//   3. if (!user) → 400 "Invalid User"     ← checked before body.issues
//   4. if (body.issues) → 400 "Invalid Body"
//   5. core.oauth2.joinGuild(...) → 201 / 204 / 400
//
// Because the user check (step 3) comes before the body-issues check (step 4),
// every unauthenticated request returns 400 "Invalid User" regardless of body validity,
// as long as the request body is parseable JSON.

const ENDPOINT = "/api/guild/join";

// ── Unauthenticated access ────────────────────────────────────────────────────

test("POST with a valid body but no auth cookie returns 400 Invalid User", async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    data: { guildId: "123456789012345678" },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.content).toBe("Invalid User");
});

test("POST with a non-numeric guildId and no auth returns 400 Invalid User", async ({
  request,
}) => {
  // Body validation would fail (guildId must match /^\d+$/), but the user check
  // fires first, so the response is still "Invalid User", not "Invalid Body".
  const res = await request.post(ENDPOINT, {
    data: { guildId: "not-a-snowflake" },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.content).toBe("Invalid User");
});

test("POST with an empty body and no auth returns 400 Invalid User", async ({ request }) => {
  const res = await request.post(ENDPOINT, { data: {} });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.content).toBe("Invalid User");
});

test("POST with a negative-number guildId string and no auth returns 400 Invalid User", async ({
  request,
}) => {
  // Negative numbers fail /^\d+$/ but user check still fires first.
  const res = await request.post(ENDPOINT, {
    data: { guildId: "-1" },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.content).toBe("Invalid User");
});

// ── Response body shape ───────────────────────────────────────────────────────

test("error response body has a 'content' field", async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    data: { guildId: "123456789012345678" },
  });
  const body = await res.json();
  expect(typeof body.content).toBe("string");
  expect(body.content.length).toBeGreaterThan(0);
});

// ── Disallowed methods ────────────────────────────────────────────────────────

test("GET is not allowed (405)", async ({ request }) => {
  const res = await request.get(ENDPOINT);
  expect(res.status()).toBe(405);
});

test("PATCH is not allowed (405)", async ({ request }) => {
  const res = await request.patch(ENDPOINT, { data: {} });
  expect(res.status()).toBe(405);
});

// ── Boundary validation (guildId regex) ──────────────────────────────────────
// The tests below can only reach body-validation errors when the user IS
// authenticated. Without auth, we still get 400 "Invalid User". These tests
// verify the auth check comes first (i.e., the response text is "Invalid User",
// not "Invalid Body"), which confirms the handler order is correct.

test("an all-zero guildId is numeric and returns Invalid User (not a body error)", async ({
  request,
}) => {
  const res = await request.post(ENDPOINT, { data: { guildId: "000000000000000000" } });
  const body = await res.json();
  // Would be a valid snowflake format; if body were invalid we'd get "Invalid Body"
  expect(body.content).toBe("Invalid User");
});

test("guildId with leading spaces returns Invalid User since user check fires first", async ({
  request,
}) => {
  const res = await request.post(ENDPOINT, { data: { guildId: " 123" } });
  const body = await res.json();
  expect(body.content).toBe("Invalid User");
});
