---
description: Domain-Driven Design concepts mapped to distopia's src/domain layer — including where the current code doesn't match the folder names
---

# Domain-Driven Design (DDD)

This documents DDD concepts **and** honestly maps them to how `src/domain/` actually behaves
today — which, in places, does not match what the folder/package names imply. Don't assume
the directory structure alone guarantees DDD patterns are in force; read this before adding
new domain logic. See also [[clean-architecture]], [[solid]], [[dry]].

## Core concepts (textbook)

| Concept | Definition |
|---|---|
| Entity | Has identity that persists across state changes (e.g. a `Guild`, identified by ID, not by its current settings) |
| Value Object | Immutable, defined entirely by its attributes, no identity (e.g. a validated `SafeUrl`) |
| Repository | An *interface*, defined in the domain layer, for retrieving/persisting entities — the domain depends on the interface, never on the storage technology |
| Domain Service | Business logic that doesn't naturally belong to one entity |
| Ubiquitous Language | Code names (classes, methods) match the vocabulary domain experts actually use |

## How this maps to distopia's `src/domain/` — current state

- **`src/domain/model` (`domain-model`)** — mostly thin re-exports, not domain entities with
  behavior. `src/domain/model/src/Guild.ts` is literally:
  ```typescript
  export type { Guild } from "infra-discord";
  ```
  The only real domain logic here is `src/domain/model/src/Error/LateLimitError.ts`, a plain
  `Error` subclass. `domain-model`'s `package.json` depends on `infra-discord` — i.e. the
  domain layer depends on infrastructure, which is backwards from DDD's intent (domain should
  have zero outward dependencies). This is an existing, accepted pattern — don't "fix" it as
  a drive-by refactor.

- **`src/domain/repository/memory` (`repo-memory`) and `src/domain/repository/search`
  (`repo-search`)** — despite the name, these are **concrete implementations**, not
  interfaces. `src/domain/repository/memory/src/Friend.ts`:
  ```typescript
  export class Friend extends Map<string, FriendValue> {}
  ```
  is a live in-memory cache. `src/domain/repository/search/src/SearchEngine.ts` wraps
  `@orama/orama` (`create`, `upsert`, `search`) directly — an infrastructure concern
  physically located inside `domain/`. There is no separate `interface Repository { ... }`
  that both this and a Postgres-backed implementation satisfy. The actual persistent store
  (Prisma-backed) lives entirely separately, in `src/infrastructure/database/src/DatabaseClient/`
  (e.g. `GuildTable.ts`), consumed directly by `app-core` — not through any shared domain
  repository abstraction.

  **`CLAUDE.md`'s Project Structure table currently labels this directory "Repository
  interfaces (memory / search)" — that comment is stale/aspirational, not accurate.** If you
  fix that comment, do it as an explicit, separate doc-only change — not bundled into an
  unrelated feature commit.

- **`src/application/core` (`app-core`)** — depends directly on `infra-database`'s and
  `infra-discord`'s concrete types (`AppState.database: DatabaseClient`,
  `AppState.searchEngine: SearchEngine` from `repo-search`), not on a domain-defined
  interface. Business logic (e.g. `Guild.bump()`) calls straight through:
  `this.state.database.guild.update(...)`.

## Practical guidance for new code

- **Don't assume `domain/` enforces isolation** — check what a file actually imports before
  treating it as infrastructure-free.
- **If you're adding a genuine business rule/invariant** (something that must always hold
  regardless of storage — e.g. "a guild can't have more than N active bumps"), put the pure
  logic in `domain/model` with no `infra-*` imports. That's the one place in this layer where
  following DDD is worth the cost.
- **Don't introduce a new "repository interface" pattern unprompted.** The existing
  `repo-memory`/`repo-search` packages work as direct implementations consumed by `app-core`;
  retrofitting an interface layer is a real architectural change that needs to be discussed,
  not done as an incidental part of another task (see `CLAUDE.md`: "Don't add features,
  refactor, or introduce abstractions beyond what the task requires").
- **Ubiquitous language**: match Discord/product vocabulary in code — e.g. "bump" (not
  "refresh" or "ping") for the bump-channel feature, since that's the term used in
  `PUBLIC_*_ROLE_ID` env vars, Prisma models, and user-facing bot commands alike.
