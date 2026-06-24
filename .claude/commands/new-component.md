---
description: Scaffold a new Svelte 5 component
---

Scaffold a new Svelte 5 component. Component name, location, and purpose: $ARGUMENTS

## Component file (`src/lib/components/<Category>/<Name>.svelte`)

```svelte
<script lang="ts">
  // import child components, utilities, types here

  type Props = {
    // required prop
    label: string;
    // optional prop with default
    value?: number;
    // snippet (replaces <slot />)
    children?: import("svelte").Snippet;
  };

  const { label, value = 0, children }: Props = $props();

  // reactive state
  let count = $state(0);

  // derived value
  const display = $derived(`${label}: ${value + count}`);

  function handleClick() {
    count++;
  }
</script>

<div>
  <p>{display}</p>
  <button onclick={handleClick}>Increment</button>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  /* styles are scoped to this component */
  p { color: white; }
</style>
```

## Rules

- **Svelte 5 runes only**: `$props()`, `$state()`, `$derived()`, `{@render children()}` — no `export let`, no `$:`, no `<slot />`
- **Type the props**: always define a `type Props` and destructure from `$props()`
- **Scoped styles**: CSS in `<style>` is component-scoped by default — no need for BEM or CSS modules
- **Event handlers**: use `onclick={fn}`, `oninput={fn}`, etc. — not `on:click`
- **Internal links**: use `resolve()` from `$app/paths` — never raw string paths
- **Client utilities**: use `Toast` from `$lib/client/toast` for user feedback, `parseErrRes` from `$lib/client/error` for API error display

## Optional: Storybook story (`<Name>.stories.svelte`)

Place alongside the component file:

```svelte
<script module>
  import MyComponent from "./MyComponent.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Components/<Category>/MyComponent",
    component: MyComponent,
  });
</script>

<Story name="Default" args={{ label: "Example" }} />
<Story name="WithValue" args={{ label: "Count", value: 42 }} />
```

## Optional: Vitest test (`<Name>.spec.ts`)

Place alongside the component file:

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

## After creating files

Run type check:

```bash
cd docker && docker compose exec app sudo bun run typecheck
```
