# Distopia — Agent Guide

Distopia is a monorepo project combining a Discord bulletin board / utility bot with a web frontend.
Site: [distopia.top](https://distopia.top)

This file is the single source of truth for coding-agent guidance in this repo. Claude Code
reads it as `CLAUDE.md`; `AGENTS.md` is a symlink to this same file (read by Codex and other
agents) — edit only `CLAUDE.md`, never `AGENTS.md` directly.

---

## Git Commit/Push Policy

**Never run `git commit` or `git push` unless the user's message explicitly invokes the
`/open-pr` or `/auto-commit-and-push` slash command in that same instance.** Plain-language
approval alone ("commit and push this", "反映してください", "yes go ahead", etc.) is **not**
sufficient — if asked in plain language, tell the user which of the two commands to invoke
instead of acting on the request directly. A prior invocation of either command does not
carry forward to later turns either; each commit/push needs its own fresh invocation.

- `/open-pr` (`.claude/commands/open-pr.md`) — commit, push, and open/update a pull request.
- `/auto-commit-and-push` (`.claude/commands/auto-commit-and-push.md`) — commit and push
  only, no PR.

---

## Development Environment

**Required: develop inside the devcontainer.** Running directly on the host is not supported.

The container user is `ubuntu` (non-root). Commands that write to the workspace (build, DB
migration, setup) require `sudo`.

> **Command prefix depends on where your shell runs.** Commands throughout this guide are
> shown in whichever form matches their section: a bare command (e.g. `sudo bun run build`)
> assumes a shell already running *inside* the devcontainer (Codex's default here); a
> `docker compose exec app ...` form assumes a shell on the host (Claude Code's default
> here). Translate by adding/dropping that prefix as needed, or just open a devcontainer
> shell directly with `docker compose exec app sh`.

### First-time Setup

```bash
# 1. Run on the host before starting the devcontainer (once only)
docker volume create distopia-db-store

# 2. Run inside the devcontainer after it starts
sudo scripts/setup.sh
```

`setup.sh` installs dependencies and runs `bun run setup` (DB migration + build).

### Environment Variable Files

| File | Purpose |
|---|---|
| `.env` | Application code (bot token, DB URL, etc.) |
| `docker/.env` | Container port forwarding settings |

Copy `.env.example` to `.env` and fill in the values.

**Never delete, overwrite, or move `.env` or `docker/.env`.** They are gitignored — once
deleted, their real values (bot token, role IDs, DB credentials, etc.) are gone with no git
history to recover from and no guaranteed backup elsewhere. If a change requires touching
one of these files, edit it in place; if you need to inspect its current values first, read
it, don't recreate it. If you ever need a clean-slate version, copy `.env.example` alongside
it under a different name — never over the real file.

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

```bash
cd docker

docker compose exec app sudo bun run build        # Build all packages
docker compose exec app sudo bun run typecheck    # Type check
docker compose exec app sudo bun run lint         # Lint
docker compose exec app sudo bun run format       # Format
docker compose exec app sudo bun run deploy-db    # Apply DB migrations
```

### Production Deploy

Production runs on k3s and is deployed via GitOps (Argo CD + Argo Workflows + Argo Events),
not by hand. A push to `main` is detected by Argo Events, built and pushed to an in-cluster
registry by Argo Workflows, and rolled out by Argo CD. See `k8s/README.md` for the full
pipeline and one-time cluster bootstrap steps.

---

## Turborepo

Turborepo manages task execution order and caching across packages. The key principle:
`^build` in `dependsOn` means all upstream dependencies must build first.

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

## Testing

```bash
cd docker

# Unit tests (per package)
docker compose exec app bun run test

# Web E2E tests (Playwright)
docker compose exec app sh -c "cd src/presentation/web && npx playwright test"

# Storybook
docker compose exec app sh -c "cd src/presentation/web && bun run storybook"
```

For a single package, run tests directly in its directory:

```bash
cd src/infrastructure/http && bun run test
cd src/presentation/bot   && bun run test
```

### Vitest Patterns

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

When wrapping native `Response` in a `Proxy`, use `Reflect.get(target, prop, target)` — using
`receiver` causes private field errors in Bun's `Response`.

Test file naming: `<module>.test.ts` (unit), `<Component>.spec.ts` (web components).

### How to Validate Changes

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

## Discord Bot Structure (`presentation-bot`)

Key layout under `src/presentation/bot/src/`:

```
src/
├── EventHandler/
│   ├── GuildMemberAddHandler.ts       # member join
│   ├── MessageCreateHandler.ts        # message receive
│   └── InteractionCreateHandler/
│       ├── Base/                      # abstract base classes
│       │   ├── ChatInputCommandInteractionBase.ts
│       │   ├── ButtonInteractionBase.ts
│       │   ├── ModalInteractionBase.ts
│       │   ├── StringSelectMenuInteractionBase.ts
│       │   ├── UserSelectMenuInteractionBase.ts
│       │   ├── RoleSelectMenuInteractionBase.ts
│       │   └── Error/
│       │       └── GuildParseError.ts
│       ├── ChatInputCommand/           # slash commands
│       ├── Button/                     # button handlers
│       ├── Modal/                      # modal handlers
│       ├── Page/                       # pagination
│       ├── StringSelectMenu/           # string select menus
│       ├── UserSelectMenu/             # user select menus
│       └── RoleSelectMenu/             # role select menus
└── utils/
    └── validator.ts                    # Zod wrapper for Discord input validation
```

`*.auto.ts` files (`Buttons.auto.ts`, `ChatInputCommands.auto.ts`, `StringSelectMenus.auto.ts`,
etc.) are auto-generated by `bun run build`, which scans these directories and regenerates
the registry files. **Never edit them manually** — after adding or removing a handler class,
just run `sudo bun run build` again.

### Handler Pattern

All interaction handlers extend a base class and override `exec`. The base class handles
routing, error replies, and permission checks.

```typescript
import { MessageFlags, type ChatInputCommandInteraction, type CacheType } from "discord.js";
import { ChatInputCommandInteractionBase } from "../Base/ChatInputCommandInteractionBase";
import { GuildParseError } from "../Base/Error/GuildParseError";

export class MyCommand extends ChatInputCommandInteractionBase {
  public override commandName: string = "my-command";
  // Optional: restrict to users with these guild permissions
  public override requireUserGuildPermissions: PermissionResolvable[] = ["Administrator"];

  protected override async exec(interaction: ChatInputCommandInteraction<CacheType>) {
    const guild = await this.parseGuild(interaction);
    if (guild instanceof GuildParseError) {
      return interaction.reply({ content: guild.message, flags: [MessageFlags.Ephemeral] });
    }

    // interaction.guildId is safe to use here (parseGuild validated it)
    await interaction.reply({ content: "Done." });
  }
}
```

The pattern is identical for `ButtonInteractionBase`, `ModalInteractionBase`, and all select
menu bases — replace `exec`'s signature with the relevant interaction type.

### Select Menu Handlers

| Type   | Base class                        | `exec` receives                            |
| ------ | ---------------------------------- | ------------------------------------------ |
| String | `StringSelectMenuInteractionBase` | `interaction, values: string[]`            |
| User   | `UserSelectMenuInteractionBase`   | `interaction, values: string[]` (user IDs) |
| Role   | `RoleSelectMenuInteractionBase`   | `interaction, values: string[]` (role IDs) |

- `customId` must be unique across **all** select menu handler types
- Use `interaction.update(...)` (not `reply`) when the menu is part of an existing message

### Validation (Zod + validator utility)

```typescript
import z from "zod";
import { validator, type ValidateResult } from "../../../utils/validator";

const OptionsSchema = z.object({
  message: z.string().min(1).max(2000),
  channelId: z.string().regex(/^\d+$/),
});
type Options = z.infer<typeof OptionsSchema>;

// In parseOptions():
return await validator(
  {
    message: interaction.fields.getTextInputValue("message"),
    channelId: interaction.fields.getTextInputValue("channelId"),
  },
  OptionsSchema,
);
// Returns Options | ValidationError
// The base class automatically sends a Discord error reply on ValidationError
```

---

## Web Frontend (`presentation-web`)

### Svelte 5 — Runes Only

This project uses **Svelte 5 runes syntax exclusively**. Do not use the Svelte 4 Options API
(`export let`, `$:`, `createEventDispatcher`, etc.).

```svelte
<script lang="ts">
  // State
  let count = $state(0);

  // Derived
  let doubled = $derived(count * 2);

  // Props
  let { title, items = [] }: { title: string; items: string[] } = $props();

  // Side effects
  $effect(() => {
    console.log(count); // re-runs when count changes
  });
</script>
```

Event handlers use the `on<event>` attribute syntax:

```svelte
<button onclick={() => count++}>Click</button>
```

### Route Structure

```
src/
├── routes/
│   ├── +layout.svelte / +layout.server.ts
│   ├── +page.svelte / +page.server.ts
│   └── api/                            # server-only API endpoints
│       └── [resource]/
│           └── +server.ts
├── lib/
│   ├── components/                     # UI components
│   ├── server/                         # server-only utilities
│   │   ├── handler.ts                  # authAndValidateHandler / validateHandler
│   │   └── db.ts                       # Prisma client
│   └── utils/                          # shared client utilities
└── app.html
```

Path aliases: `$lib` → `src/lib/`, `$env/dynamic/private` for server env vars.

### API Endpoint Pattern

```typescript
// src/routes/api/[resource]/+server.ts
import { authAndValidateHandler } from "$lib/server/handler";
import type { RequestHandler } from "./$types";
import { json } from "@sveltejs/kit";
import z from "zod";

const BodySchema = z.object({
  guildId: z.string(),
  content: z.string().max(1000),
});

export const POST: RequestHandler = await authAndValidateHandler(BodySchema, async (e, body) => {
  // body is typed as z.infer<typeof BodySchema>
  // e is the RequestEvent — e.locals.session for auth context
  return json({ ok: true });
});
```

- `authAndValidateHandler` — requires valid session + validates body against schema; returns HTTP 401/400 on failure
- `validateHandler` — validates body only, no auth check
- Both return HTTP 400 automatically if `BodySchema.safeParse` fails

### Lint, Format, and Testing

This package uses **ESLint + Prettier** (not oxlint/oxfmt) — the `lib/template/` configs do
**not** apply here.

```bash
cd src/presentation/web && bun run lint
cd src/presentation/web && bun run format
```

Component tests use `vitest-browser-svelte` (runs in a real browser via Playwright):

```bash
cd src/presentation/web && bun run test:unit
```

E2E tests use Playwright, and Storybook is available:

```bash
cd src/presentation/web && npx playwright test
cd src/presentation/web && bun run storybook
```

Test files: `<Component>.spec.ts` (component), `<route>.spec.ts` (E2E, in `tests/`).

### Dev Server

```bash
cd src/presentation/web && bun run dev      # Vite dev server on port 5173
cd src/presentation/web && bun run preview  # Preview on port 4173
```

The web build uses Vite + SvelteKit adapter; build output goes to `.svelte-kit/`.

---

## Database (`infra-database`)

- ORM: Prisma 7
- DB: PostgreSQL 17 (Docker container `distopia-db`)
- After schema changes, apply migrations with `docker compose exec app sudo bun run deploy-db`
  from the `docker/` directory.

### Schema Location

```
src/infrastructure/database/
├── prisma/
│   ├── schema.prisma          # ← edit this for schema changes
│   ├── migrations/            # ← auto-generated; commit these to git
│   └── sql/                   # TypedSQL raw query files (.sql)
└── src/
    ├── zod/                   # ← AUTO-GENERATED by build — never edit
    ├── prisma-client/         # ← AUTO-GENERATED by build — never edit
    └── sql/                   # ← AUTO-GENERATED by build — never edit
```

**Never edit anything in `src/zod/`, `src/prisma-client/`, or `src/sql/` — they are
regenerated on every `bun run build`.**

### Migration Workflow

1. **Edit the schema** — modify `prisma/schema.prisma`.
2. **Format and validate**:
   ```bash
   cd src/infrastructure/database && bunx prisma format
   cd src/infrastructure/database && bunx prisma validate
   ```
3. **Generate migration** (interactive — run in a devcontainer shell):
   ```bash
   cd src/infrastructure/database
   bunx prisma migrate dev --name <kebab-case-description>
   ```
   Examples: `add-guild-setting-bump-channel`, `add-user-web-verify-key`. This creates
   `prisma/migrations/<timestamp>_<name>/migration.sql` — commit this file to git.
4. **Apply migration** (from the monorepo root): `sudo bun run deploy-db` — runs
   `prisma migrate deploy` and regenerates the Prisma client.
5. **Rebuild to regenerate TypeScript types**: `sudo bun run build` — regenerates
   `src/prisma-client/` (client types), `src/zod/` (Zod schemas via `zod-prisma-types`), and
   `src/sql/` (TypedSQL wrappers, if `.sql` files changed).

### Prisma Schema Notes

| Column type            | Runtime type      | Note                                          |
| ----------------------- | ------------------ | ---------------------------------------------- |
| `BigInt`                | `bigint`           | Requires `Number()` before JSON serialization |
| `Bytes`                 | `Buffer`           | Used for JWT keys (`jwtVerifyKey`, `key`)     |
| `DateTime @updatedAt`   | managed by Prisma  | Never set manually                            |

### TypedSQL (raw SQL queries)

To add a raw SQL query:

1. Create `prisma/sql/<queryName>.sql` with named parameters (`$1::type`)
2. Run `bun run build` to generate the typed wrapper in `src/sql/`
3. Import and use:
   ```typescript
   import { myQuery } from "@prisma/client/sql";
   const result = await prisma.$queryRawTyped(myQuery(param1, param2));
   ```

### Importing from Other Packages

```typescript
// Prisma client
import { prisma } from "infra-database";

// Zod-generated schemas
import type { GuildCreateInput, UserUpdateInput } from "infra-database/types";

// TypedSQL
import { myQuery } from "@prisma/client/sql";
```

---

## HTTP Infrastructure (`infra-http`)

`src/infrastructure/http` is a security-focused HTTP utility package that guards against SSRF
and unsafe external requests. No build step — consumed directly as TypeScript source by
other packages. **Dependencies: `zod` only — do not add `jsdom` or other DOM libs, they were
intentionally removed.**

### Key exports

| Export | Description |
|---|---|
| `SafeUrl` | Branded `string & { __brand: "distopiaSafeUrl" }` — validated http/https URL |
| `safeUrl` | Tagged template literal that `encodeURIComponent`-encodes all interpolated values |
| `validateSafeUrl` | Validates a raw string URL (http/https, well-formed) using a Zod schema, returns `SafeUrl \| null` |
| `safeFetch` | Fetch wrapper with SSRF protection, DNS pinning, body size limit, manual redirect handling, and timeout |
| `safeFetchForDiscord` | `safeFetch` variant restricted to Discord domains only (`discord.com`, `discordapp.com`, `discord.gg`) |
| `isLocalUrl` | Returns `true` if a URL resolves to a private/local address (blocks SSRF) |
| `isInviteLink` | Follows redirects via `safeFetch`; returns `{ content: boolean, isUsedCf: boolean }` |
| `isUsedCf` | Synchronous — detects Cloudflare challenge pages via the `cf-mitigated: challenge` response header |

### SafeUrl — Never Cast Raw Strings

```typescript
import { safeUrl, validateSafeUrl } from "infra-http";

// For URLs with user-controlled parts
const url = safeUrl`https://example.com/user/${userId}`;

// For external URLs (e.g. from DB, Discord events)
const url = validateSafeUrl(rawString);
if (url === null) return; // invalid — not http/https or malformed

// NEVER: rawString as SafeUrl — bypasses all validation
```

### SSRF / DNS Rebinding Protection Architecture

`safeFetch` applies these protections in order:

1. **Domain allowlist** (`safeFetchForDiscord` only) — rejects non-Discord hostnames immediately
2. **DNS resolution** — calls `resolveHostnameToSafeIp`, which resolves once and validates all IPs
3. **Private IP block** — blocks `0.0.0.0/8`, `127.x`, `10.x`, `100.64.0.0/10` (CGNAT, RFC 6598), `172.16–31.x`, `192.168.x`, `169.254.x`, and IPv6 equivalents
4. **URL pinning** — replaces the hostname in the URL with the resolved IP; prevents DNS rebinding
5. **IPv6 bracketing** — IPv6 results are wrapped in brackets (`[2001:db8::1]`) before being set as `URL.hostname` (required — raw IPv6 silently fails there)
6. **`redirect: "manual"`** — always set; prevents the runtime from auto-following redirects and bypassing DNS pinning
7. **Manual redirect loop** — follows `Location` headers manually; strips `Authorization`/`Cookie` on cross-origin hops
8. **`response.url` proxy** — wraps the final `Response` in a `Proxy` so `response.url` returns the original hostname URL, not the pinned IP

### Error Types

```typescript
import {
  LocalAddressError,   // target URL resolved to a private/local IP
  InvalidDomainError,  // Discord-only fetch: non-Discord domain
  RedirectError,       // redirect chain exceeded DEFAULT_MAX_REDIRECT
  HeaderError,         // missing/invalid location header, or non-http(s) redirect target
  BodySizeError,       // response body exceeds the allowed size limit
} from "infra-http";

const result = await safeFetch(url);
if (result instanceof LocalAddressError) { /* ... */ }
// else: Response
```

### isUsedCf

```typescript
import { isUsedCf } from "infra-http";

// Synchronous — no await needed
if (isUsedCf(response)) {
  // Cloudflare challenge (cf-mitigated: challenge header present)
  // Reliable across JS challenges, managed challenges, CAPTCHAs
  // Status code and language independent
}
```

### Testing This Package

```bash
cd src/infrastructure/http && bun run test
# or from the monorepo root:
bun run test -- --filter=infra-http
```

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
    url,
    status,
    headers: new Headers(headers),
    clone() {
      return fakeResponse(url, status, body, headers);
    },
    async text() {
      return body;
    },
    body: null,
  } as unknown as Response;
}
```

When testing `isUsedCf`, pass a response with `{ "cf-mitigated": "challenge" }` in headers —
no HTML body needed.

### Adding a New Fetch Call

1. Import `safeUrl` (template) or `validateSafeUrl` (external string)
2. Call `safeFetch` or `safeFetchForDiscord`
3. Check `result instanceof Error` before using the response
4. Never call `fetch` directly — it bypasses all SSRF protections

---

## Lint/Format Template (`distopia-template`)

`lib/template` is an internal package (`distopia-template`) that centralises oxlint and oxfmt configuration for all non-web packages in the monorepo.

### Shared configs

| File | Consumed via |
|---|---|
| `lib/template/oxfmt.config.ts` | `--config ../../../lib/template/oxfmt.config.ts` |
| `lib/template/oxlint.config.ts` | `--config ../../../lib/template/oxlint.config.ts` |

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

> The web package (`presentation-web`) uses ESLint + Prettier instead and does **not** consume these configs.

---

## Dependency Version Pins

Package versions live in more places than each package's `package.json`. When bumping a dependency, grep for the old version string across the whole repo — not just `package.json` — and update every location:

| Location | What it pins |
|---|---|
| `package.json` (per package) | Direct dependency versions |
| Root `package.json` → `workspaces.catalog` | Shared versions consumed via `"catalog:"` (e.g. `bun`, `oxfmt`, `oxlint`, `typescript`, `vitest`, `zod`, `discord.js`, `@types/node`) |
| Root `package.json` → `packageManager` | Must match the `bun` catalog version |
| `lib/distopia/jsr.json` → `imports` | Duplicate pins for JSR publishing (`oxfmt`, `oxlint`, `tsdown`, `jsr`, `zod`, `@types/node`) — must match `lib/distopia/package.json` / the catalog |
| `docker/dockerfile` → `ARG ..._VERSION` | Tool versions baked into the devcontainer image. `BUN_VERSION` must match the catalog `bun` version; `PLAYWRIGHT_VERSION` must match `playwright` in `src/presentation/web/package.json` |
| `.github/workflows/*.yml` → `bun-version` | CI-pinned bun version — must match the catalog `bun` version (`release.yml` currently pins it in 3 places) |

**Dependabot does not track `catalog:` entries** — it only opens PRs for direct `package.json` versions. Run `bun outdated` to check catalog packages (`bun`, `oxfmt`, `oxlint`, `typescript`, etc.) separately; nothing will surface them otherwise.

---

## Versioning & Releases

Changesets is used for versioning.

```bash
# Version bump (CI / release maintainers only)
bun run version
```

No Changesets interaction is needed during normal development.
