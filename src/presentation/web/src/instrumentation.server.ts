import { SENTRY_DATA_COLLECTION } from "#lib/sentry.js";
import { PUBLIC_SENTRY_DSN } from "$app/env/public";
import * as Sentry from "@sentry/sveltekit";

Sentry.init({
  dsn: PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  dataCollection: SENTRY_DATA_COLLECTION,
});
