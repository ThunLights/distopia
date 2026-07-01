# Distopia — Codex Agent Guide

Distopia is a monorepo project combining a Discord bulletin board / utility bot with a web frontend.
Site: [distopia.top](https://distopia.top)

---

## Environment

**This agent runs inside the devcontainer.** All shell commands execute directly — do **not** prefix them with `docker compose exec`.

The container user is `ubuntu` (non-root). Commands that write to the workspace (build, DB migration, setup) require `sudo`.

### First-time Setup

```bash
# Run once after the devcontainer starts
sudo scripts/setup.sh
```

`setup.sh` installs dependencies and runs `bun run setup` (DB migration + build).

### Environment Variable Files

| File | Purpose |
|---|---|
| `.env` | Application code (bot token, DB URL, etc.) |
| `docker/.env` | Container port forwarding settings |

Copy `.env.example` to `.env` and fill in the values.

### Dev Ports

| Port | Purpose |
|---|---|
| 5173 | Vite dev server (SvelteKit) |
| 4173 | Vite preview |
| 3000 | Production build preview |
| 6006 | Storybook |

---

## Project Structure

```
distopia/
├── src/
│   ├── presentation/
│   │   ├── bot/          # Discord bot (discord.js v14)
│   │   └── web/          # Web frontend (SvelteKit / Svelte 5)
│   ├── application/
│   │   ├── core/         # Application core services
│   │   └── schedule/     # Scheduled tasks
│   ├── domain/
│   │   ├── model/        # Domain models
│   │   └── repository/   # Repository interfaces (memory / search)
│   └── infrastructure/
│       ├── database/     # Prisma + PostgreSQL
│       ├── discord/      # Discord infrastructure
│       └── http/         # Security-focused HTTP utilities (SSRF prevention)
├── lib/
│   ├── distopia/         # Public library (npm / jsr)
│   └── template/         # Shared lint/format config (oxlint + oxfmt)
├── docker/               # Docker Compose configs
├── scripts/              # Setup and utility scripts
└── .devcontainer/        # Devcontainer config
```

### Package Name Reference

| Directory | Package name |
|---|---|
| `src/presentation/bot` | `presentation-bot` |
| `src/presentation/web` | `presentation-web` |
| `src/application/core` | `app-core` |
| `src/application/schedule` | `app-schedule` |
| `src/infrastructure/database` | `infra-database` |
| `src/infrastructure/discord` | `infra-discord` |
| `src/infrastructure/http` | `infra-http` |
| `src/domain/repository/memory` | `repo-memory` |
| `src/domain/repository/search` | `repo-search` |
| `src/domain/model` | `domain-model` |
| `lib/distopia` | `distopia` |
| `lib/template` | `distopia-template` |

---

## Tech Stack

| Category | Technology |
|---|---|
| Runtime / Package manager | Bun |
| Monorepo | Turborepo |
| Language | TypeScript 6 |
| Discord bot | discord.js v14 |
| Web framework | SvelteKit 2 / Svelte 5 |
| Database | PostgreSQL 17 + Prisma 7 |
| Validation | Zod 4 |
| Testing | Vitest + Playwright |
| Lint (bot) | oxlint + oxfmt |
| Lint (web) | ESLint + Prettier |
| Versioning | Changesets |

---

## Commands

Run these directly inside the devcontainer (no `docker compose exec` needed):

```bash
sudo bun run build        # Build all packages
sudo bun run typecheck    # Type check
sudo bun run lint         # Lint
sudo bun run format       # Format
sudo bun run deploy-db    # Apply DB migrations
```

### Production Deploy (run on the host, outside devcontainer)

```bash
environment/production.sh
```

---

## Turborepo

Turborepo manages task execution order and caching across packages. The key principle: `^build` in `dependsOn` means all upstream dependencies must build first.

```
build     → dependsOn: ["^build"]           (dependencies build before dependents)
test      → dependsOn: ["build", "^test"]   (same package must build first)
typecheck → dependsOn: ["^typecheck"]
lint / format → no dependencies
```

To run a task scoped to one package:

```bash
bun run build -- --filter=infra-http
bun run test  -- --filter=presentation-bot
```

If a task is skipped unexpectedly (cache hit), force re-run:

```bash
bun run build -- --force
```

---

## Testing (Vitest)

Unit tests use Vitest. Key patterns:

```typescript
// vi.mock is hoisted — declare before the import that uses it
vi.mock("./safefetch", () => ({ safeFetch: vi.fn() }));
import { safeFetch } from "./safefetch";

// Preserve real exports, mock only one function
vi.mock("./dns", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./dns")>();
  return { ...actual, resolveHostnameToSafeIp: vi.fn() };
});

// Typed mock
import type { MockedFunction } from "vitest";
const mock = safeFetch as MockedFunction<typeof safeFetch>;
mock.mockResolvedValueOnce(new Response("ok"));

// Global fetch stub
beforeEach(() => { vi.stubGlobal("fetch", vi.fn()); });
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
```

When wrapping native `Response` in a `Proxy`, use `Reflect.get(target, prop, target)` — using `receiver` causes private field errors in Bun's `Response`.

Test file naming: `<module>.test.ts` (unit), `<Component>.spec.ts` (web components).

---

## Validation (Zod 4)

All input validation uses Zod 4 (`import { z } from "zod"`). Key patterns:

- Always use `safeParse` at trust boundaries; `parse` only for internal trusted data
- Use `refine` for custom constraints, `transform` to change the output type
- `ValidateResult<T>` in the bot: `T | ValidationError` — the base class handles Discord error replies
- `authAndValidateHandler` / `validateHandler` in the web: auto-returns HTTP 400 on Zod failure
- `validateSafeUrl(url)` in infra-http: returns `SafeUrl | null` (Zod schema internally)
- Generated Zod schemas in `infra-database/src/zod/` — never edit manually

---

## How to Validate Changes

After making code changes, run the following in order:

```bash
# 1. Type check
sudo bun run typecheck

# 2. Unit tests (all packages via Turborepo)
bun run test

# 3. Lint (fix automatically if needed)
sudo bun run lint
sudo bun run format

# 4. Web E2E tests (only when touching src/presentation/web)
cd src/presentation/web && npx playwright test
```

For a single package, run tests directly in its directory:

```bash
cd src/infrastructure/http && bun run test
cd src/presentation/bot   && bun run test
```

---

## Code Guidelines

- **No comments** unless the *why* is non-obvious (hidden constraint, workaround, subtle invariant).
- **No trailing summaries** in responses — output only the relevant change.
- **No backwards-compatibility hacks** — if something is unused, delete it.
- **No error handling for impossible cases** — only validate at system boundaries.
- **Prefer editing existing files** over creating new ones.
- **Comments must be in English.**
- **Do not edit `*.auto.ts` files** — they are auto-generated by `bun run build`.
- Use `SafeUrl` / `safeUrl` template tag instead of raw strings for all fetch call URLs.
- Input validation must use **Zod 4** schemas.

---

## Discord Bot Structure

Key layout under `src/presentation/bot/src/`:

- **EventHandler/** — Discord event handlers
  - `GuildMemberAddHandler.ts` — member join events
  - `MessageCreateHandler.ts` — message receive events
  - `InteractionCreateHandler/` — interaction handling
    - `ChatInputCommand/` — slash commands
    - `Button/` — buttons
    - `Modal/` — modals
    - `Page/` — pagination
    - `RoleSelectMenu/` / `StringSelectMenu/` / `UserSelectMenu/` — select menus

`*.auto.ts` files (`Buttons.auto.ts`, `ChatInputCommands.auto.ts`, etc.) are auto-generated by `bun run build`. **Never edit them manually.**

---

## Database

- ORM: Prisma 7 (`infra-database` package)
- DB: PostgreSQL 17 (Docker container `distopia-db`)
- After schema changes: `sudo bun run deploy-db`

---

## HTTP Infrastructure (`infra-http`)

`src/infrastructure/http` is a security-focused HTTP utility package that guards against SSRF and unsafe external requests.

### Key exports

| Export | Description |
|---|---|
| `SafeUrl` | Branded string type — marks a URL as validated for use in fetch calls |
| `safeUrl` | Tagged template literal that `encodeURIComponent`-encodes all interpolated values |
| `validateSafeUrl` | Validates a raw string URL (http/https, well-formed) using a Zod schema and brands it as `SafeUrl` |
| `safeFetch` | Fetch wrapper with SSRF protection, DNS pinning, body size limit, manual redirect handling, and timeout |
| `safeFetchForDiscord` | `safeFetch` variant restricted to Discord domains only (`discord.com`, `discordapp.com`, `discord.gg`) |
| `isLocalUrl` | Returns `true` if a URL resolves to a private/local address (blocks SSRF) |
| `isInviteLink` | Follows redirects via `safeFetch` and checks whether the final URL is a Discord invite link |
| `isUsedCf` | Detects Cloudflare challenge pages via the `cf-mitigated: challenge` response header |

### SSRF / DNS rebinding protection

- `safeFetch` resolves DNS **once**, validates all returned IPs, then replaces the hostname with the resolved IP in the request URL (DNS pinning). This prevents DNS rebinding attacks.
- Both IPv4 and IPv6 literals are validated against private/reserved ranges (including `100.64.0.0/10` CGNAT per RFC 6598).
- IPv6 results from DNS are automatically wrapped in brackets (`[2001:db8::1]`) before being set as `URL.hostname`.
- All redirects are followed manually; `Authorization` and `Cookie` headers are stripped on cross-origin redirects.
- `redirect: "manual"` is set on all `fetch` calls to prevent the runtime from bypassing DNS pinning.

### Error types

| Error | Meaning |
|---|---|
| `LocalAddressError` | Target URL resolved to a private/local IP |
| `InvalidDomainError` | Domain is not in the allowed list (Discord-only fetch) |
| `RedirectError` | Redirect chain exceeded `DEFAULT_MAX_REDIRECT` |
| `HeaderError` | Missing or invalid `location` header, or non-http(s) redirect target |
| `BodySizeError` | Response body exceeds the allowed size limit |

### Usage notes

- Always use `SafeUrl` / `safeUrl` template tag instead of raw strings when constructing URLs for fetch calls.
- Use `validateSafeUrl` (not a bare cast) when receiving URLs from external input.
- `safeFetch` wraps the returned `Response` in a `Proxy` so `response.url` exposes the original hostname rather than the pinned IP.
- This package has no build step — it is consumed directly as TypeScript source.

---

## Lint/Format Template (`distopia-template`)

`lib/template` centralises oxlint and oxfmt configuration for all non-web packages.

### oxfmt settings

| Option | Value |
|---|---|
| Print width | 100 |
| Semicolons | yes |
| Quotes | double |
| Indent | 2 spaces |
| Trailing commas | all |
| Import sorting | enabled |
| Ignored patterns | `*.auto.ts`, `dist/**` |

### oxlint settings

- Plugins: `typescript`, `unicorn`, `oxc`
- All `correctness` rules are errors
- Ignored patterns: `*.auto.ts`, `dist/**`

> `presentation-web` uses ESLint + Prettier instead and does **not** consume these configs.

---

## Versioning & Releases

Changesets is used for versioning. No Changesets interaction is needed during normal development.

```bash
# Version bump — CI / release maintainers only
bun run version
```
