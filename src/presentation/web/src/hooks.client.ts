import { env } from "$env/dynamic/public";
import { getClient, handleErrorWithSentry, init } from "@sentry/sveltekit";

init({
  dsn: env.PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Session Replay is added lazily below instead of listed here -- see loadReplay().

  dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: [],
  },
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

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
