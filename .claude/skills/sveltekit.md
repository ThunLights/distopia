---
description: SvelteKit 2 + Svelte 5 patterns, conventions, and project structure for presentation-web
---

# SvelteKit + Svelte 5 Guide

Package: `presentation-web` — `src/presentation/web/`

## Svelte 5 Runes Mode (enforced project-wide)

`svelte.config.js` sets `runes: true` for all non-`node_modules` files. **Never use Svelte 4 syntax.**

| Svelte 4 (forbidden) | Svelte 5 runes (use this) |
|---|---|
| `export let foo` | `const { foo } = $props()` |
| `$: derived = a + b` | `const derived = $derived(a + b)` |
| `let count = 0` (reactive) | `let count = $state(0)` |
| `<slot />` | `{@render children()}` |
| `on:click={fn}` | `onclick={fn}` |
| `<svelte:component this={C} />` | `<C />` (direct) |

## Component Pattern

```svelte
<script lang="ts">
  import OtherComponent from "$lib/components/OtherComponent.svelte";

  type Props = {
    label: string;
    value?: number;
    children?: import("svelte").Snippet;
  };

  const { label, value = 0, children }: Props = $props();

  let count = $state(0);
  const doubled = $derived(count * 2);

  function increment() {
    count++;
  }
</script>

<div>
  <p>{label}: {value}</p>
  <button onclick={increment}>{count} (×2 = {doubled})</button>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  /* scoped by default */
  p { color: white; }
</style>
```

## Route File Structure

```
src/routes/
  <path>/
    +page.svelte          # page component (receives data from load)
    +page.server.ts       # server-side load / form actions
    +layout.svelte        # layout wrapping child routes
    +layout.server.ts     # layout server-side load
    +server.ts            # API endpoint (GET/POST/DELETE/etc.)
    +error.svelte         # error boundary for this segment
```

## `+page.server.ts` — Load Function

```typescript
import type { PageServerLoad } from "./$types";
import { redirect, error } from "@sveltejs/kit";

export const load: PageServerLoad = async (e) => {
  // query params
  const word = e.url.searchParams.get("w");

  // dynamic route params (e.g. routes/guilds/[id]/+page.server.ts)
  const id = e.params.id;

  // authenticated user (set by hooks.server.ts)
  const { user } = e.locals; // UserAuth | null

  // parent layout data
  const parentData = await e.parent();

  // redirect
  if (!user) throw redirect(302, "/login");

  // HTTP error
  if (!id) throw error(404, { message: "Not found" });

  return { someData: "value" };
};
```

## `+page.svelte` — Consuming Load Data

```svelte
<script lang="ts">
  const { data } = $props();
  const { someData } = $derived(data);
</script>
```

## `+server.ts` — API Endpoint

Always use the handler wrappers from `$lib/server/handler` rather than raw request parsing:

```typescript
import { authHandler, validateHandler, authAndValidateHandler } from "$lib/server/handler";
import { errorJson } from "$lib/server/res";
import { json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";

// Auth only
export const GET: RequestHandler = await authHandler(async (e) => {
  return json({ id: e.locals.user.id });
});

// Validation only (no auth)
const Schema = z.object({ name: z.string() });
export const POST: RequestHandler = await validateHandler(Schema, async (e, body) => {
  return json({ name: body.name });
});

// Auth + validation
export const PUT: RequestHandler = await authAndValidateHandler(Schema, async (e, body) => {
  return json({ userId: e.locals.user.id, name: body.name });
});

// Manual 400 error response
return errorJson("Something went wrong");
```

## Path Aliases

| Alias | Resolves to |
|---|---|
| `$lib/...` | `src/lib/...` |
| `$app/paths` | SvelteKit paths utilities (`resolve`) |
| `$app/state` | SvelteKit reactive state (`page`) |
| `$env/static/public` | Public env vars (`PUBLIC_*`) |
| `$env/static/private` | Private env vars (server-only) |

Env file location: `.env` at the **monorepo root** (configured via `env.dir: "../../../"` in `svelte.config.js`).

## Navigation — Always Use `resolve()`

Internal links **must** use `resolve()` from `$app/paths` to respect the base path:

```svelte
<script lang="ts">
  import { resolve } from "$app/paths";
</script>

<a href={resolve("/search")}>Search</a>
```

Direct string paths (`href="/search"`) are flagged by ESLint rule `svelte/no-navigation-without-resolve`. To suppress intentionally: `/* eslint svelte/no-navigation-without-resolve: "off" */`.

## Client-Side Utilities

All in `src/lib/client/`:

```typescript
import { Toast } from "$lib/client/toast";
Toast.success("Done!");
Toast.error("Failed.");

import { parseErrRes } from "$lib/client/error";
// parses { content } from a 400 response and shows an error toast
await parseErrRes(response);

import { createRedirectEvent } from "$lib/client/redirect";
const go = createRedirectEvent("https://example.com");
```

## SEO / Meta Tags — `<Meta>` Component

```svelte
<script lang="ts">
  import Meta from "$lib/components/Meta.svelte";
</script>

<Meta title="Page Title" description="Page description" />
```

`Meta` sets `<title>`, OGP tags, Twitter card tags, and theme-color via `<svelte:head>`.

## Error Page State

In `+error.svelte`, use `$app/state`:

```svelte
<script lang="ts">
  import { page } from "$app/state";
</script>

<p>{page.status}</p>
<p>{page.error?.message}</p>
```

## hooks.server.ts — Per-Request Auth

Every request passes through `src/hooks.server.ts`, which:
1. Reads the `authorization` cookie
2. Verifies the JWT and sets `event.locals.user` (`UserAuth | null`)
3. Silently renews the cookie if the token is near expiry
4. Sets `Cache-Control: no-store` on every response

**Do not replicate this logic in individual routes.** Always read `e.locals.user`.

## Shared Types for API Routes

Client-facing request/response shapes live in `src/lib/shared/types/routes/`. Define a type here whenever a `+server.ts` response is consumed from `+page.svelte` or a client utility.

## Component Testing (Vitest + vitest-browser-svelte)

Test files: `<ComponentName>.spec.ts` alongside the `.svelte` file.

```typescript
import { render } from "vitest-browser-svelte";
import { page } from "vitest/browser";
import { describe, expect, test } from "vitest";
import MyComponent from "./MyComponent.svelte";

describe("MyComponent", () => {
  test("renders label", async () => {
    render(MyComponent, { label: "Hello" });
    await expect.element(page.getByText("Hello")).toBeVisible();
  });
});
```

Run tests:

```bash
cd docker && docker compose exec app sh -c "cd src/presentation/web && bun run test:unit"
```

## Storybook Stories

Story files: `<ComponentName>.stories.svelte` alongside the `.svelte` file.

```svelte
<script module>
  import MyComponent from "./MyComponent.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Components/Category/MyComponent",
    component: MyComponent,
  });
</script>

<Story name="Default" args={{ label: "Hello" }} />
```

Start Storybook:

```bash
cd docker && docker compose exec app sh -c "cd src/presentation/web && bun run storybook"
```

## Lint / Format (web package)

The web package uses **ESLint + Prettier** (not oxlint/oxfmt):

```bash
# Check
cd docker && docker compose exec app sh -c "cd src/presentation/web && bun run lint"

# Auto-fix formatting
cd docker && docker compose exec app sh -c "cd src/presentation/web && bun run format"

# Type check (svelte-check)
cd docker && docker compose exec app sh -c "cd src/presentation/web && bun run typecheck"
```
