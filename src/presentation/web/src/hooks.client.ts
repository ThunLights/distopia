import { SENTRY_DATA_COLLECTION } from "#lib/sentry.js";
import { PUBLIC_SENTRY_DSN } from "$app/env/public";
import { getClient, handleErrorWithSentry, init } from "@sentry/sveltekit";

init({
  dsn: PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  replaysSessionSampleRate: 0.1,

  replaysOnErrorSampleRate: 1.0,

  // Session Replay is added lazily below instead of listed here -- see loadReplay().

  dataCollection: SENTRY_DATA_COLLECTION,
});

// Session Replay is one of the heaviest parts of the Sentry SDK. Referencing `replayIntegration`
// only inside this dynamic import (never via a static import elsewhere in this file) keeps it out
// of the eagerly-loaded entry chunk that every page load has to parse and execute -- it ends up in
// its own chunk, fetched only once the page has settled. This doesn't change which sessions
// actually get recorded, since that's still governed by replaysSessionSampleRate/
// replaysOnErrorSampleRate above, read whenever the integration is added.
//
// Trade-off: Replay isn't active until this runs, so a page view that ends (tab closed,
// navigated away) before then produces no replay and no replaysOnErrorSampleRate coverage for
// errors thrown in that window. Accepted deliberately -- reducing parse/eval cost for every
// visitor outweighs replay coverage for the rare very-short-lived view.
function loadReplay() {
  import("@sentry/sveltekit").then(({ replayIntegration }) => {
    getClient()?.addIntegration(replayIntegration());
  });
}

if (typeof requestIdleCallback === "function") {
  // timeout ensures this still fires under continuous page activity, where an idle period may
  // otherwise never occur -- matching the setTimeout fallback's 4s bound below.
  requestIdleCallback(loadReplay, { timeout: 4000 });
} else {
  setTimeout(loadReplay, 4000);
}

// A deploy replaces the hashed chunks, so a tab opened before it fails to lazy-load the next
// route ("Failed to fetch dynamically imported module" / "Unable to preload CSS"). Reloading
// picks up the new build's HTML instead of surfacing the error.
window.addEventListener("vite:preloadError", (event) => {
  // Reload at most once a minute so a chunk that is genuinely missing can't loop the page.
  const key = "distopia:preloadErrorReloadAt";
  const last = Number(sessionStorage.getItem(key) ?? 0);
  if (Date.now() - last < 60_000) return;
  sessionStorage.setItem(key, String(Date.now()));
  event.preventDefault();
  location.reload();
});

export const handleError = handleErrorWithSentry();
