// Static mock for $env/dynamic/public, aliased in from .storybook/main.ts's viteFinal.
// Storybook's static build never runs SvelteKit's request/server lifecycle, so top-level
// `env.PUBLIC_X` access in modules like $lib/shared/constant.ts throws "Cannot read
// properties of undefined" for every story that transitively imports it.
//
// Kept as a plain module (no `vi.mock`) since this file is loaded by Storybook's actual Vite
// build, not by Vitest -- `vi` doesn't exist there. See env.ts for the Vitest-based
// equivalent; the values below must stay in sync with it by hand since Vitest's mock
// hoisting rules block sharing one module between the two (see env.ts's comment).
export const env = {
  PUBLIC_URL: "http://localhost:3000",
  PUBLIC_OWNER_ID: "0",
  PUBLIC_HOME_SERVER_ID: "0",
  PUBLIC_STAFF_ROLE_ID: "0",
  PUBLIC_HONORARY_MEMBER_ROLE_ID: "0",
  PUBLIC_SPECIAL_BOARD_OF_DIRECTORS_ROLE_ID: "0",
  PUBLIC_BOARD_OF_DIRECTORS_ROLE_ID: "0",
  PUBLIC_SUB_BOARD_OF_DIRECTORS_ROLE_ID: "0",
  PUBLIC_BOT_ID: "0",
  PUBLIC_SENTRY_DSN: "",
};
