import { expect, test } from "@playwright/test";

// POST /api/guild/search
//
// Schema (PostBodySchema):
//   term: string, max 500 chars  (CHARACTER_LIMIT.searchTerm)
//   type: "normal" | "nsfw" | "all"
//
// Returns 200 + { guilds, count, time } on success.
// Returns 400 when validation fails (handled by validateHandler).

const ENDPOINT = "/api/guild/search";

test("valid body returns 200 with the expected response shape", async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    data: { term: "test", type: "all" },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body.guilds)).toBe(true);
  expect(typeof body.count).toBe("number");
  expect(typeof body.time).toBe("string");
});

test("type='normal' is accepted and returns 200", async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    data: { term: "test", type: "normal" },
  });
  expect(res.status()).toBe(200);
});

test("type='nsfw' is accepted and returns 200", async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    data: { term: "test", type: "nsfw" },
  });
  expect(res.status()).toBe(200);
});

test("empty JSON object (missing required fields) returns 400", async ({ request }) => {
  const res = await request.post(ENDPOINT, { data: {} });
  expect(res.status()).toBe(400);
});

test("missing 'type' field returns 400", async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    data: { term: "test" },
  });
  expect(res.status()).toBe(400);
});

test("missing 'term' field returns 400", async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    data: { type: "all" },
  });
  expect(res.status()).toBe(400);
});

test("term longer than 500 characters returns 400", async ({ request }) => {
  // CHARACTER_LIMIT.searchTerm = 500
  const res = await request.post(ENDPOINT, {
    data: { term: "a".repeat(501), type: "all" },
  });
  expect(res.status()).toBe(400);
});

test("term of exactly 500 characters returns 200", async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    data: { term: "a".repeat(500), type: "all" },
  });
  expect(res.status()).toBe(200);
});

test("invalid 'type' value returns 400", async ({ request }) => {
  const res = await request.post(ENDPOINT, {
    data: { term: "test", type: "invalid_type" },
  });
  expect(res.status()).toBe(400);
});

test("GET method is not allowed (405)", async ({ request }) => {
  const res = await request.get(ENDPOINT);
  // SvelteKit returns 405 for unimplemented methods.
  expect(res.status()).toBe(405);
});
