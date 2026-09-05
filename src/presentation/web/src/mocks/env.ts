import { vi } from "vitest";

// $env/dynamic/public only gets populated by SvelteKit's own request/server lifecycle
// (real dev server, or the built adapter-node server at process start) -- outside of that
// (unit tests, Storybook stories imported directly by Vitest), the virtual module has no
// `env` to read, so top-level `env.PUBLIC_X` access in modules like $lib/shared/constant.ts
// throws. Stub it with static test values instead.
//
// The mock object is inlined here rather than imported from a shared file: vi.mock's
// factory is hoisted above imports, and Vitest's browser-mode mocker rejects any reference
// to an externally-imported variable inside it (even one prefixed "mock", which works in
// Node-mode Vitest but not here) with "There was an error when mocking a module". See
// env.storybook.ts for the same static values used by Storybook's static build, which has
// no such constraint but also can't share this module directly (it isn't run through
// Vitest, so `vi` doesn't exist there) -- keep the two in sync by hand if env var names
// ever change.
//
// $env/dynamic/private is deliberately NOT mocked here: JWTClient.test.ts and friends rely
// on the real DATABASE_URL (from the devcontainer's .env, pointing at the distopia-db
// service) to run against an actual database -- mocking it would silently break those.
vi.mock("$env/dynamic/public", () => ({
  env: {
    PUBLIC_URL: "http://localhost:3000",
    PUBLIC_OWNER_ID: "0",
    PUBLIC_HOME_SERVER_ID: "0",
    PUBLIC_SUPPORT_SERVER_ID: "0",
    PUBLIC_STAFF_ROLE_ID: "0",
    PUBLIC_HONORARY_MEMBER_ROLE_ID: "0",
    PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID: "0",
    PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID: "0",
    PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID: "0",
    PUBLIC_BOT_ID: "0",
    PUBLIC_SENTRY_DSN: "",
  },
}));
