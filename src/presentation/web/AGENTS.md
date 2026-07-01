# presentation-web — Codex Agent Guide

Package `presentation-web` — SvelteKit 2 / Svelte 5 web frontend.

---

## Svelte 5 — Runes Only

This project uses **Svelte 5 runes syntax exclusively**. Do not use the Svelte 4 Options API (`export let`, `$:`, `createEventDispatcher`, etc.).

```svelte
<script lang="ts">
  // State
  let count = $state(0);

  // Derived
  let doubled = $derived(count * 2);

  // Props
  let { title, items = [] }: { title: string; items: string[] } = $props();

  // Side effects
  $effect(() => {
    console.log(count); // re-runs when count changes
  });
</script>
```

Event handlers use the `on<event>` attribute syntax:

```svelte
<button onclick={() => count++}>Click</button>
```

---

## Route Structure

```
src/
├── routes/
│   ├── +layout.svelte / +layout.server.ts
│   ├── +page.svelte / +page.server.ts
│   └── api/                            # server-only API endpoints
│       └── [resource]/
│           └── +server.ts
├── lib/
│   ├── components/                     # UI components
│   ├── server/                         # server-only utilities
│   │   ├── handler.ts                  # authAndValidateHandler / validateHandler
│   │   └── db.ts                       # Prisma client
│   └── utils/                          # shared client utilities
└── app.html
```

Path aliases: `$lib` → `src/lib/`, `$env/static/private` for server env vars.

---

## API Endpoint Pattern

```typescript
// src/routes/api/[resource]/+server.ts
import { authAndValidateHandler } from "$lib/server/handler";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import z from "zod";

const BodySchema = z.object({
  guildId: z.string(),
  content: z.string().max(1000),
});

export const POST: RequestHandler = await authAndValidateHandler(BodySchema, async (e, body) => {
  // body is typed as z.infer<typeof BodySchema>
  // e is the RequestEvent — e.locals.session for auth context
  return json({ ok: true });
});
```

- `authAndValidateHandler` — requires valid session + validates body against schema; returns HTTP 401/400 on failure
- `validateHandler` — validates body only, no auth check
- Both return HTTP 400 automatically if `BodySchema.safeParse` fails

---

## Lint and Format

This package uses **ESLint + Prettier** (not oxlint/oxfmt):

```bash
bun run lint
bun run format
```

The `lib/template/` oxlint/oxfmt configs do **not** apply here.

---

## Testing

Component tests use `vitest-browser-svelte` (runs in a real browser via Playwright):

```bash
cd src/presentation/web && bun run test:unit
```

E2E tests use Playwright:

```bash
cd src/presentation/web && npx playwright test
```

Storybook:

```bash
cd src/presentation/web && bun run storybook
```

Test files: `<Component>.spec.ts` (component), `<route>.spec.ts` (E2E, in `tests/`).

---

## Build and Type Check

```bash
sudo bun run build        # Build all packages (requires sudo for file permissions in devcontainer)
sudo bun run typecheck
```

The web build uses Vite + SvelteKit adapter. Build output goes to `.svelte-kit/`.

---

## Dev Server

```bash
cd src/presentation/web && bun run dev   # Vite dev server on port 5173
cd src/presentation/web && bun run preview  # Preview on port 4173
```
