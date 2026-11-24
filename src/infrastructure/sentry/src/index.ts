import * as Sentry from "@sentry/bun";

// Side-effect module: import it first in a Bun service's entry point so init runs before the
// rest of the module graph is evaluated. No DSN (local dev, CI) leaves the SDK disabled.
Sentry.init({
  dsn: process.env.PUBLIC_SENTRY_DSN,
  // These services report most failures by catching and console.error-ing them (feature
  // listeners, schedule tasks, the bot's process-level handlers), so that is where errors
  // have to be picked up -- uncaught exceptions alone would miss nearly all of them.
  integrations: [Sentry.captureConsoleIntegration({ levels: ["error"] })],
  // Same v10 baseline as presentation-web's lib/sentry.ts (see why there): these processes
  // carry the bot token and RPC bearer tokens, so nothing beyond it may leave by default.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: { request: false, response: false },
    httpBodies: [],
    urlQueryParams: false,
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,
    queues: false,
    graphQL: { document: false, variables: false },
  },
});
