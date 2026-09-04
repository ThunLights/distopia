---
description: DRY principle for distopia — where the codebase already avoids duplication, and when NOT to abstract (premature-abstraction guidance)
---

# DRY (Don't Repeat Yourself)

DRY targets duplicated *knowledge* — a business rule, invariant, or config value expressed in
more than one place, at risk of drifting out of sync. It does **not** mean "two blocks of
code that merely look similar must share an abstraction." See also [[solid]], [[ddd]],
[[clean-architecture]].

## Where this repo already applies it well

- **`*.auto.ts` codegen** — `Buttons.auto.ts`, `ChatInputCommands.auto.ts`, etc. are generated
  by `bun run build` scanning the handler directories. Without this, every new command would
  need to be manually registered in a second place (the router), and the two would eventually
  drift. Never hand-edit these files — that reintroduces the duplication codegen exists to
  remove.
- **`workspaces.catalog`** (root `package.json`) — shared dependency versions (`bun`,
  `oxfmt`, `oxlint`, `typescript`, `vitest`, `zod`, `discord.js`, `@types/node`) are pinned
  once and consumed via `"catalog:"` everywhere, instead of each package repeating its own
  version string that could silently diverge. See `CLAUDE.md`'s "Dependency Version Pins"
  table for every place a version still has to be kept in sync by hand (Dependabot doesn't
  track `catalog:` entries).
- **`lib/template` (`distopia-template`)** — centralizes oxlint/oxfmt config for every
  non-web package, so lint rules don't need re-declaring per package.
- **`zod-prisma-types`** — Zod schemas for every Prisma model are generated from
  `schema.prisma` into `src/infrastructure/database/src/zod/` rather than hand-written
  duplicates of the Prisma model shape that could fall out of sync with the schema.
- **`SafeUrl`/`safeFetch`** (`infra-http`) — SSRF protection (DNS pinning, private-IP
  blocking, redirect handling) is centralized so no call site re-implements those checks
  (and inevitably gets one of them wrong or forgets one).

## When NOT to deduplicate

This project's `CLAUDE.md` "Code Guidelines" already state the rule: *"Three similar lines is
better than a premature abstraction. No half-finished implementations either."* — that's DRY's
actual boundary, not a contradiction of it.

Concretely:

- **Similar shape ≠ same knowledge.** The bot's Zod option schemas (`presentation-bot`) and
  the web's Zod body schemas (`presentation-web`) both validate strings and IDs, but they
  validate *different* things for *different* trust boundaries (Discord modal input vs. HTTP
  request bodies). Don't force them to share a schema just because they look alike — a change
  to one for Discord-specific reasons shouldn't have to touch web validation too.
- **Don't abstract on the first repeat.** Wait for a third occurrence, or for a concrete case
  where the duplicated logic actually drifted (a bug in one copy not fixed in the other) —
  that's the signal DRY is meant to catch, not "I typed something similar twice."
- **Don't build a shared helper "for future use."** If nothing calls it yet, it's dead code
  with an abstraction cost and no payoff (see `CLAUDE.md`: "Don't design for hypothetical
  future requirements").
