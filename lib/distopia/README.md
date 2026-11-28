# distopia

[![npm](https://img.shields.io/npm/v/distopia)](https://www.npmjs.com/package/distopia)
[![JSR](https://jsr.io/badges/@distopia/distopia)](https://jsr.io/@distopia/distopia)

Public library for [Distopia](https://distopia.top), the Discord server bulletin board. It
ships the pieces of the [studio-distopia/distopia](https://github.com/studio-distopia/distopia)
monorepo that are useful outside of it:

- **Member-verification plugin contract** — types for writing a private verify plugin
- **`VerifyService` Connect RPC contract** — the service definition plus bearer-token auth
- **SSRF-safe HTTP utilities** — `safeFetch`, `SafeUrl`, Discord invite-link detection
- **Shared lint/format config** — the oxlint / oxfmt settings the monorepo uses

## Installation

```sh
npm install distopia
# or
bun add distopia
# or (JSR)
npx jsr add @distopia/distopia
```

ESM and CommonJS builds are both included, with type definitions. Node.js-compatible
runtimes only (`node:crypto` and `node:dns` are used).

## Member-verification plugins

Distopia's verify service loads plugin files from a folder and merges them into one
`VerifyServerPlugin`. A plugin can add its own pass/fail check, serve a browser-side script,
and encrypt the request body. Real plugins are kept private and mounted at deploy time; this
package lets you write and type-check one without the monorepo.

```ts
import type { FingerprintServerPlugin } from "distopia";

const plugin: FingerprintServerPlugin = {
  // `extra` is whatever your client script's collect() returned.
  evaluate({ guildId, userId, extra, request }) {
    return request.ip !== null && typeof extra === "object" && extra !== null;
  },
  getClientScript() {
    return `export default { collect: () => ({ ua: navigator.userAgent }) };`;
  },
};

export default plugin;
```

| Type                                                    | Role                                                                                  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `VerifyServerPlugin`                                    | Full server-side contract: `evaluate`, `getClientScript`, `getClientWasm?`, `decrypt` |
| `VerifyClientPlugin`                                    | Browser-side module served by `getClientScript`: `init?`, `collect`, `encrypt?`       |
| `VerifyRequestContext`                                  | Request headers (cookie/authorization stripped) and best-effort client IP             |
| `FingerprintServerPlugin` / `FingerprintClientPlugin`   | Signal-only plugin: `evaluate` + `collect`                                            |
| `AntiScrapingServerPlugin` / `AntiScrapingClientPlugin` | Body cipher only: `decrypt` + `encrypt`                                               |

Each file may implement any subset (`Partial<VerifyServerPlugin>`). Across files, every
`evaluate` must pass; `getClientScript` / `decrypt` come from the first file (alphabetically)
that defines them, and `getClientWasm` must live in the same file as the winning
`getClientScript`. If the client plugin defines `encrypt()`, the server plugin must define the
matching `decrypt()`.

## VerifyService RPC

```ts
import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { createBearerAuthInterceptor, VerifyService } from "distopia";

const client = createClient(
  VerifyService,
  createConnectTransport({
    baseUrl: process.env.VERIFY_RPC_URL!,
    httpVersion: "1.1",
    interceptors: [createBearerAuthInterceptor(process.env.VERIFY_RPC_TOKEN!)],
  }),
);
```

On the server side, add `requireBearerAuth(token)` to your interceptors. It compares tokens in
constant time and rejects bad ones with `Code.Unauthenticated`. The proto source is
[`proto/distopia/verify/v1/verify.proto`](./proto/distopia/verify/v1/verify.proto).

## HTTP utilities

`safeFetch` resolves DNS once, blocks private and loopback addresses, pins the request to the
resolved IP (preventing DNS rebinding), follows redirects manually (dropping
`Authorization`/`Cookie` when a redirect goes to another origin), and enforces a timeout and a
1 MiB body limit. It returns an `Error` instead of throwing.

```ts
import { safeFetch, safeUrl, validateSafeUrl } from "distopia";

const url = safeUrl`https://example.com/users/${userId}`; // interpolations are URI-encoded
const external = validateSafeUrl(untrustedString); // SafeUrl | null

const res = await safeFetch(url);
if (res instanceof Error) {
  // LocalAddressError | HeaderError | RedirectError | BodySizeError
  return;
}
console.log(await res.text());
```

| Export                                                           | Description                                                            |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `safeFetch(url, init?, options?)`                                | SSRF-safe `fetch` (see above)                                          |
| `safeFetchForDiscord(url, init?)`                                | `safeFetch` limited to `discord.com` / `discordapp.com` / `discord.gg` |
| `safeUrl` / `validateSafeUrl` / `SafeUrl`                        | Branded http(s) URL type and its two constructors                      |
| `isInviteLink(url)`                                              | Follows redirects to decide whether a URL is a Discord invite          |
| `isUsedCf(response)`                                             | Detects a Cloudflare challenge (`cf-mitigated: challenge`)             |
| `isLocalUrl` / `isLocalIPv4` / `isLocalIPv6` / `isLocalHostname` | Private/local address checks                                           |

## Lint and format config

```ts
// oxlint.config.ts
import { oxlintCfg } from "distopia";
export default oxlintCfg;
```

```ts
// oxfmt.config.ts
import { oxfmtCfg } from "distopia";
export default oxfmtCfg;
```

## Development

This package is built from the monorepo (`lib/distopia`), not on its own. Run
`bun run build -- --filter=distopia` from the repo root. The RPC code in `src/gen/` is
generated by `buf generate` and is not committed. Releases go through Changesets, and see
[CHANGELOG.md](./CHANGELOG.md) for history.

## License

MIT
