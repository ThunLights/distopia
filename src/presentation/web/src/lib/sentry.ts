import type { init } from "@sentry/sveltekit";

type DataCollection = NonNullable<Parameters<typeof init>[0]>["dataCollection"];

// Sentry v11 replaced `sendDefaultPii` with `dataCollection` AND flipped its default: leaving
// it unset (or `{}`) now opts into collecting cookies, request/response bodies, database query
// parameters and GenAI payloads, where v10 collected none of that. That default is wrong for
// this app in a specific way -- the session JWT travels in the `authorization` cookie (see
// hooks.server.ts), so collected cookies would ship live credentials to a third party, and
// request bodies would carry login and guild-edit payloads with them.
//
// So the v10 baseline is pinned explicitly here rather than inherited: upgrading the SDK must
// not widen what leaves the process. Opting any category back in is a deliberate decision to
// make on its own, not a side effect of a version bump. Shared by both init sites
// (hooks.client.ts and instrumentation.server.ts) so they cannot drift apart.
export const SENTRY_DATA_COLLECTION: DataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
    response: { deny: ["forwarded", "-ip", "remote-", "via", "-user"] },
  },
  httpBodies: [],
  // Stricter than the v10 baseline, which only denied the PII header snippets above. Those are
  // header-name substrings, so they match no query key this app uses: the `/auth` OAuth callback
  // lands with `?code=&state=`, and the SDK's own always-on sensitive-key list covers neither.
  // Denying the two known keys would leave the next one to leak, and the only query params here
  // (`t`, `w`) are not worth a triage round-trip, so drop the whole category.
  urlQueryParams: false,
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
};
