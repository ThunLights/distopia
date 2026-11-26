import { goto } from "$app/navigation";
import { page } from "$app/state";

/** Navigates to the current URL with `params` applied (`null` deletes a key), adding a history entry. */
export function setQuery(params: Record<string, string | null>) {
  const url = new URL(page.url.href);
  for (const [key, value] of Object.entries(params)) {
    if (value === null) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  }
  // `url` is the current page's own (already resolved) URL; only the query changes.
  // eslint-disable-next-line svelte/no-navigation-without-resolve
  return goto(url, { keepFocus: true, noScroll: true });
}
