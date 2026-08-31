import packageJson from "../../../../package.json" with { type: "json" };
import { expect, test } from "@playwright/test";

// GET /~partytown/*
//
// Serves the @qwik.dev/partytown library files straight from the installed package (see
// +server.ts) instead of vite-plugin-partytown's default static copy, so that a long-lived
// Cache-Control can be applied -- adapter-node only does that automatically for _app/immutable/.

const partytownVersion = packageJson.dependencies["@qwik.dev/partytown"];

test("home page loads partytown.js with the installed version as a cache-busting query param", async ({
  page,
}) => {
  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url().includes("/~partytown/partytown.js")),
    page.goto("/"),
  ]);

  expect(response.status()).toBe(200);
  expect(response.url()).toContain(`/~partytown/partytown.js?v=${partytownVersion}`);
});

test("window.partytown is configured and the library actually initializes", async ({ page }) => {
  // On load, partytown.js registers partytown-sw.js as a service worker, then (once active)
  // creates a sandbox iframe pointed at partytown-sandbox-sw.html -- a virtual URL synthesized
  // entirely by that service worker's own fetch handler, not served by any origin route.
  // Confirmed identical in production (distopia.top) and this build. Waiting for it is a real
  // signal the library executed successfully end-to-end, not just that the <script> tag loaded.
  const [followUpRequest] = await Promise.all([
    page.waitForRequest(/\/~partytown\/partytown-sandbox-sw\.html/, { timeout: 10_000 }),
    page.goto("/"),
  ]);

  const followUpResponse = await followUpRequest.response();
  expect(followUpResponse?.status()).toBe(200);

  const partytownConfig = await page.evaluate(
    () => (window as unknown as { partytown?: { forward?: string[]; debug?: boolean } }).partytown,
  );
  expect(partytownConfig?.forward).toEqual(["dataLayer.push"]);
  // Production must not ship the debug (unminified) build to real visitors -- see
  // hooks.server.ts's PARTYTOWN_DEBUG_PLACEHOLDER substitution.
  expect(partytownConfig?.debug).toBe(false);
});

test("GET /~partytown/partytown.js returns the library file with a long-lived immutable Cache-Control", async ({
  request,
}) => {
  const res = await request.get(`/~partytown/partytown.js?v=${partytownVersion}`);

  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/javascript");
  expect(res.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");

  const body = await res.text();
  expect(body).toContain("Partytown");
});

test("query string does not affect which file is served", async ({ request }) => {
  const [withQuery, withoutQuery] = await Promise.all([
    request.get(`/~partytown/partytown.js?v=${partytownVersion}`),
    request.get("/~partytown/partytown.js"),
  ]);

  expect(await withQuery.text()).toBe(await withoutQuery.text());
});

test("GET /~partytown/<unknown file>.js returns 404", async ({ request }) => {
  const res = await request.get("/~partytown/does-not-exist.js");
  expect(res.status()).toBe(404);
});

test("GET /~partytown/<non-.js file> returns 404", async ({ request }) => {
  const res = await request.get("/~partytown/partytown.txt");
  expect(res.status()).toBe(404);
});

test("/~partytown/* is exempt from the site-wide no-store Cache-Control", async ({ request }) => {
  // hooks.server.ts forces Cache-Control: no-store on every response except this path.
  const res = await request.get(`/~partytown/partytown.js?v=${partytownVersion}`);
  expect(res.headers()["cache-control"]).not.toContain("no-store");
});
