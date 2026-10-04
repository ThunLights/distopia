import { env } from "$env/dynamic/public";
import { SENTRY_DATA_COLLECTION } from "$lib/sentry";
import * as Sentry from "@sentry/sveltekit";

Sentry.init({
  dsn: env.PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  dataCollection: SENTRY_DATA_COLLECTION,
});
