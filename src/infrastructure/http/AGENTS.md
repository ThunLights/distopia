# infra-http — Codex Agent Guide

Package `infra-http` — security-focused HTTP utility library. No build step; consumed directly as TypeScript source by other packages.

**Dependencies: `zod` only. Do not add `jsdom` or other DOM libs — they were intentionally removed.**

---

## Key Exports

| Export | Description |
|---|---|
| `SafeUrl` | Branded `string & { __brand: "distopiaSafeUrl" }` — validated http/https URL |
| `safeUrl` | Tagged template literal — encodes interpolated values with `encodeURIComponent` |
| `validateSafeUrl` | Validates a raw string via Zod schema, returns `SafeUrl \| null` |
| `safeFetch` | SSRF-protected fetch with DNS pinning, redirect loop, body size limit, timeout |
| `safeFetchForDiscord` | `safeFetch` restricted to `discord.com`, `discordapp.com`, `discord.gg` |
| `isLocalUrl` | Returns `true` if the URL resolves to a private/reserved IP |
| `isInviteLink` | Follows redirects and returns `{ content: boolean, isUsedCf: boolean }` |
| `isUsedCf` | Synchronous — returns `true` if `res.headers.get("cf-mitigated") === "challenge"` |

---

## SafeUrl — Never Cast Raw Strings

```typescript
import { safeUrl, validateSafeUrl } from "infra-http";

// For URLs with user-controlled parts
const url = safeUrl`https://example.com/user/${userId}`;

// For external URLs (e.g. from DB, Discord events)
const url = validateSafeUrl(rawString);
if (url === null) return; // invalid — not http/https or malformed

// NEVER: rawString as SafeUrl — bypasses all validation
```

---

## SSRF / DNS Rebinding Protection Architecture

`safeFetch` applies these protections in order:

1. **Domain allowlist** (safeFetchForDiscord only) — rejects non-Discord hostnames immediately
2. **DNS resolution** — calls `resolveHostnameToSafeIp` which resolves once and validates all IPs
3. **Private IP block** — blocks 0.0.0.0/8, 127.x, 10.x, 100.64.0.0/10 (CGNAT RFC 6598), 172.16–31.x, 192.168.x, 169.254.x, and IPv6 equivalents
4. **URL pinning** — replaces hostname in the URL with the resolved IP; prevents DNS rebinding
5. **IPv6 bracketing** — `resolvedIp.includes(":") ? \`[\${resolvedIp}]\` : resolvedIp` (required — raw IPv6 silently fails as `URL.hostname`)
6. **`redirect: "manual"`** — always set; prevents the runtime from auto-following redirects and bypassing DNS pinning
7. **Manual redirect loop** — follows Location headers manually; strips `Authorization`/`Cookie` on cross-origin hops
8. **`response.url` proxy** — wraps the final Response in a Proxy so `response.url` returns the original hostname URL, not the pinned IP

---

## Error Types

```typescript
import { LocalAddressError, InvalidDomainError, RedirectError, HeaderError, BodySizeError } from "infra-http";

const result = await safeFetch(url);
if (result instanceof LocalAddressError) { /* private IP */ }
if (result instanceof InvalidDomainError) { /* Discord-only: non-discord domain */ }
if (result instanceof RedirectError) { /* too many redirects */ }
if (result instanceof HeaderError) { /* bad Location header */ }
if (result instanceof BodySizeError) { /* body too large */ }
// else: Response
```

---

## isUsedCf

```typescript
import { isUsedCf } from "infra-http";

// Synchronous — no await needed
if (isUsedCf(response)) {
  // Cloudflare challenge (cf-mitigated: challenge header present)
  // Reliable across JS challenges, managed challenges, CAPTCHAs
  // Status code and language independent
}
```

---

## validateSafeUrl (Zod schema)

`validateSafeUrl` uses a Zod 4 schema internally (`z.string().refine(...).transform(...)`). It accepts only well-formed http/https URLs. Returns `SafeUrl | null`.

---

## Testing This Package

Run from the devcontainer root:

```bash
cd src/infrastructure/http && bun run test
# or from the monorepo root:
bun run test -- --filter=infra-http
```

### Test patterns

```typescript
// Mock safeFetch at module level (hoisted)
vi.mock("./safefetch", () => ({ safeFetch: vi.fn() }));

// Mock DNS while keeping other exports real
vi.mock("./dns", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./dns")>();
  return { ...actual, resolveHostnameToSafeIp: vi.fn() };
});

// Fake Response helper
function fakeResponse(url: string, status = 200, body = "", headers: Record<string, string> = {}) {
  return {
    url, status,
    headers: new Headers(headers),
    clone() { return fakeResponse(url, status, body, headers); },
    async text() { return body; },
    body: null,
  } as unknown as Response;
}

// Stub global fetch
beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
```

When testing `isUsedCf`, pass a response with `{ "cf-mitigated": "challenge" }` in headers. No HTML body needed.

---

## Adding a New Fetch Call

1. Import `safeUrl` (template) or `validateSafeUrl` (external string)
2. Call `safeFetch` or `safeFetchForDiscord`
3. Check `result instanceof Error` before using the response
4. Never call `fetch` directly — it bypasses all SSRF protections
