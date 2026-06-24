---
description: Scaffold a new SvelteKit page with server-side load
---

Scaffold a new SvelteKit page. Route path and purpose: $ARGUMENTS

## File structure to create

For a route at `src/routes/<path>/`:

### 1. `+page.server.ts` — server-side data loading

```typescript
import type { PageServerLoad } from "./$types";
// import { redirect, error } from "@sveltejs/kit";

export const load: PageServerLoad = async (e) => {
  // e.locals.user — UserAuth | null (set by hooks.server.ts)
  // e.params.id   — dynamic segment value (if route is [id])
  // e.url.searchParams.get("key") — query string

  return {
    // data passed to +page.svelte
  };
};
```

### 2. `+page.svelte` — page component (Svelte 5 runes)

```svelte
<script lang="ts">
  import Meta from "$lib/components/Meta.svelte";

  const { data } = $props();
  // const { someField } = $derived(data);
</script>

<Meta title="Page Title" />

<section>
  <!-- page content -->
</section>

<style>
  /* scoped styles */
</style>
```

## Key rules

- **Always use `resolve()` from `$app/paths`** for internal `<a href>` values — direct string paths trigger the ESLint rule `svelte/no-navigation-without-resolve`
- **Auth guard**: check `e.locals.user` in `+page.server.ts` and `throw redirect(302, "/login")` if the page requires login
- **Svelte 5 only**: use `$props()`, `$state()`, `$derived()`, `{@render children()}` — never Svelte 4 syntax
- **Shared types**: if the page data shape is used elsewhere (e.g. by client fetch calls), define it in `src/lib/shared/types/routes/`

## After creating the files

Run type check to confirm no errors:

```bash
cd docker && docker compose exec app sudo bun run typecheck
```
