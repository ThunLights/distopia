---
description: Security-focused HTTP utilities in infra-http — SafeUrl, safeFetch, SSRF/DNS-rebinding protection, and Cloudflare detection
---

# infra-http Guide

Package: `infra-http` — `src/infrastructure/http/`

Zero-dependency (aside from Zod) HTTP utility package. All exports are TypeScript source — no build step.

## Key Exports

| Export | Type | Description |
|---|---|---|
| `SafeUrl` | branded type | String validated as a well-formed http/https URL |
| `safeUrl` | tagged template | Builds a `SafeUrl` with interpolated values `encodeURIComponent`-encoded |
| `validateSafeUrl` | function | Validates a raw string via Zod schema and brands it as `SafeUrl`; returns `null` on failure |
| `safeFetch` | async function | SSRF-protected fetch with DNS pinning, redirect loop, body size limit, and timeout |
| `safeFetchForDiscord` | async function | `safeFetch` variant restricted to Discord domains only |
| `isLocalUrl` | async function | Returns `true` if the URL resolves to a private/local IP (blocks SSRF) |
| `isInviteLink` | async function | Follows redirects and checks if the final URL is a Discord invite |
| `isUsedCf` | function | Returns `true` if the response has `cf-mitigated: challenge` header (Cloudflare challenge) |

## SafeUrl — Branded Type

`SafeUrl` is a branded string: it is `string & { __brand: "distopiaSafeUrl" }`. TypeScript prevents passing raw strings where a `SafeUrl` is expected.

### Creating a SafeUrl

```typescript
import { safeUrl, validateSafeUrl } from "infra-http";

// 1. Tagged template — for URLs with interpolated user input
const url = safeUrl`https://example.com/user/${userId}/profile`;
// interpolated values are encodeURIComponent-encoded automatically

// 2. validateSafeUrl — for URLs from external input (e.g. Discord events, DB)
const safeUrl = validateSafeUrl(rawUrl);
if (safeUrl === null) {
  // URL is not well-formed or not http/https — reject it
}
```

**Never cast raw strings**: `url as SafeUrl` bypasses the validation — always use `validateSafeUrl` for external input.

## safeFetch

```typescript
import { safeFetch, safeUrl } from "infra-http";

const response = await safeFetch(
  safeUrl`https://example.com/api`,
  { method: "GET", headers: { "User-Agent": "distopia/1.0" } },
  { detectDiscordProtocol: true }, // optional: allow discord:// redirect as a terminal condition
);

if (response instanceof Error) {
  // LocalAddressError | HeaderError | RedirectError | BodySizeError
}
// else: Response
```

### Protections built in

| Protection | Detail |
|---|---|
| DNS pinning | Resolves hostname once, validates IP, replaces hostname with IP in the request URL to prevent DNS rebinding |
| Private IP blocking | Blocks 0.0.0.0/8, 127.0.0.0/8, 10.0.0.0/8, 100.64.0.0/10 (CGNAT, RFC 6598), 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, and IPv6 equivalents |
| IPv6 bracketing | Raw IPv6 literals from DNS are wrapped in `[...]` before setting `URL.hostname` (silent assignment otherwise) |
| Manual redirects | `redirect: "manual"` is always set; redirects are followed in a loop with credential stripping |
| Cross-origin credential strip | `Authorization` and `Cookie` headers are removed on cross-origin redirects |
| Body size limit | Returns `BodySizeError` if the body exceeds the configured max size |
| Timeout | `AbortSignal.timeout(DEFAULT_TIMEOUT)` on every fetch call |
| `response.url` | A `Proxy` restores the original hostname URL so callers can check domains even after IP pinning |

## safeFetchForDiscord

```typescript
import { safeFetchForDiscord, safeUrl } from "infra-http";

const response = await safeFetchForDiscord(
  safeUrl`https://discord.com/api/v10/users/@me`,
  { headers: { Authorization: `Bot ${token}` } },
);

if (response instanceof InvalidDomainError) { /* not a discord domain */ }
if (response instanceof LocalAddressError) { /* Discord domain resolved to private IP */ }
// else: Response
```

Allowed domains: `discord.com`, `discordapp.com`, `discord.gg`. Any other hostname returns `InvalidDomainError` without calling `fetch`. DNS rebinding protection is also applied.

## isInviteLink

```typescript
import { isInviteLink } from "infra-http";

const result = await isInviteLink("https://some-shortener.example.com/abc");

if (result instanceof Error) {
  // LocalAddressError | HeaderError | RedirectError | BodySizeError
}

const { content, isUsedCf } = result;
// content: true if the final URL / Location header is a Discord invite
// isUsedCf: true if Cloudflare challenge page was detected
```

## isUsedCf

```typescript
import { isUsedCf } from "infra-http";

const res = await fetch("https://example.com");
if (isUsedCf(res)) {
  // Cloudflare challenge page (cf-mitigated: challenge header present)
}
```

Synchronous. Checks `res.headers.get("cf-mitigated") === "challenge"`. Reliable across all Cloudflare challenge types (JS challenge, managed challenge, CAPTCHA) and response languages.

## Error Types

```typescript
import {
  LocalAddressError,
  InvalidDomainError,
  RedirectError,
  HeaderError,
  BodySizeError,
} from "infra-http";

// All extend Error; use instanceof to discriminate
if (result instanceof LocalAddressError) { ... }
```

| Error | Thrown when |
|---|---|
| `LocalAddressError` | URL resolves to a private/reserved IP |
| `InvalidDomainError` | Domain not in allowed list (`safeFetchForDiscord`) |
| `RedirectError` | Redirect chain exceeds `DEFAULT_MAX_REDIRECT` |
| `HeaderError` | Missing/invalid `location` header, or non-http(s) redirect protocol |
| `BodySizeError` | Response body exceeds size limit |

## isLocalUrl

```typescript
import { isLocalUrl } from "infra-http";

await isLocalUrl("http://192.168.1.1/") // true
await isLocalUrl("http://example.com/")  // false (resolves to public IP)
```

Performs a DNS lookup and checks all returned A/AAAA records against the private IP list. Used internally by `safeFetch`; also exported for standalone checks.

## Adding a New Safe HTTP Call

1. Import `safeUrl` and `safeFetch` (or `safeFetchForDiscord` for Discord-only calls)
2. Build the URL with the `safeUrl` template tag
3. Check for `instanceof Error` before using the response
4. Never cast raw strings to `SafeUrl`

```typescript
import { safeFetch, safeUrl } from "infra-http";

async function fetchUserData(userId: string) {
  const response = await safeFetch(safeUrl`https://api.example.com/users/${userId}`);
  if (response instanceof Error) return null;
  return await response.json();
}
```
