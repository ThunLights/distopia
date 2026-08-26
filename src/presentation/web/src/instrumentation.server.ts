import { env } from "$env/dynamic/public";
import * as Sentry from "@sentry/sveltekit";

Sentry.init({
  dsn: env.PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: import.meta.env.DEV,
});
