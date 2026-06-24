---
description: Scaffold a new auth-protected SvelteKit route or API endpoint
---

Scaffold a new auth-protected route. Describe what it should do: $ARGUMENTS

## Decide the route type

### A. Protected page (`+page.server.ts`)

Create `src/presentation/web/src/routes/<path>/+page.server.ts`:

```typescript
import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async (e) => {
  if (!e.locals.user) throw redirect(302, "/login");

  // fetch data here using e.locals.user.id
  return { user: e.locals.user };
};
```

`e.locals.user` is `UserAuth | null` — type `UserAuth` is `{ id: string; username: string; avatarUrl?: string }`.

---

### B. Protected API endpoint — auth only (`+server.ts`)

```typescript
import { authHandler } from "$lib/server/handler";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = await authHandler(async (e) => {
  const { user } = e.locals; // UserAuth (non-null)
  return json({ id: user.id });
});
```

Returns HTTP 400 `{ content: "Invalid User" }` automatically when not authenticated.

---

### C. Protected API endpoint — auth + body validation (`+server.ts`)

```typescript
import { authAndValidateHandler } from "$lib/server/handler";
import { json } from "@sveltejs/kit";
import z from "zod";
import type { RequestHandler } from "./$types";

const BodySchema = z.object({
  // define expected fields
});

export const POST: RequestHandler = await authAndValidateHandler(BodySchema, async (e, body) => {
  const { user } = e.locals;
  // body is typed as z.infer<typeof BodySchema>
  return json({});
});
```

Returns HTTP 400 with validation error messages automatically on bad input.

---

### D. Validation-only endpoint (no auth required)

Use `validateHandler` from `$lib/server/handler` — same signature as `authAndValidateHandler` but without the auth check.

---

## After creating the route

1. Add the corresponding Svelte page (`+page.svelte`) if it's a page route
2. Add a shared type for the response body under `src/presentation/web/src/lib/shared/types/routes/` if it is consumed by client-side code
3. Run type check to confirm no errors:

```bash
cd docker && docker compose exec app sudo bun run typecheck
```
