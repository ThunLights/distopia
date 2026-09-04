---
description: Clean Architecture dependency rule mapped to distopia's presentation/application/domain/infrastructure layers, including known violations to not repeat
---

# Clean Architecture

The dependency rule: source-code dependencies point **inward only** —
`presentation → application → domain`, with `infrastructure` implementing interfaces the
inner layers define, never the other way around. `domain` should depend on nothing else in
the system. See also [[ddd]], [[solid]], [[dry]].

## How distopia's directories map to this

```
src/presentation/  →  src/application/  →  src/domain/
  bot, web              core, schedule       model, repository
                                    ↑
src/infrastructure/  (should implement interfaces domain/application define,
  database, discord,    not be depended on directly by inner layers)
  http
```

**In principle.** In practice, dependency arrows in this codebase point outward in several
places — documented here so you don't mistake the folder names for a guarantee, and so new
code doesn't add to the list.

## Known violations (existing — don't silently "fix" these as a drive-by refactor)

| Location | Violation |
|---|---|
| `src/domain/model` (`domain-model` package.json) | Depends on `infra-discord` — domain depending on infrastructure, the opposite of the dependency rule. `src/domain/model/src/Guild.ts` re-exports `infra-discord`'s `Guild` type directly. |
| `src/application/core` (`AppState.ts`) | Depends on concrete `infra-database` (`DatabaseClient`) and `repo-search` (`SearchEngine`) types directly, not on an interface defined by `domain/`. |
| `src/presentation/web/src/lib/server/JWTClient.ts` | A service class that otherwise routes through `app-core`'s `core.jwt` also imports `type { JWTAlg } from "infra-database/types"` directly — presentation reaching past application into infrastructure mid-logic. |

`presentation-bot` is the one package that stays clean here — it has no direct `infra-*`
imports; everything goes through `app-core`. Some direct `infra-*` imports in
`presentation-web`'s composition-root files (`lib/server/database.ts`,
`bot.ts` — wiring up clients at startup) are normal and expected; that's different from a
mid-logic service class reaching into infra types, which is the pattern to avoid.

## Practical guidance for new code

- **New presentation-layer code (bot commands, web routes/handlers) should call into
  `application/core`, not `infra-*` directly** — follow `presentation-bot`'s existing
  discipline, not `JWTClient.ts`'s exception.
- **Composition-root wiring (server startup, DI setup) is the one legitimate place**
  presentation code touches `infra-*` directly — don't treat that as license to do it inside
  business-logic classes too.
- **Don't retrofit interfaces into `application/core` or `domain/` unprompted.** The
  violations above are established, working patterns in this codebase; correcting them is a
  real architectural change that needs its own discussion and scope, not something to bundle
  into an unrelated feature or bugfix (see `CLAUDE.md`'s "don't refactor beyond what the task
  requires").
- **If a task explicitly is about improving layering** (e.g. "make app-core testable without
  a real DB"), the direction to move in is: define the narrow interface `app-core` actually
  needs (not a full `DatabaseClient` re-abstraction) in `domain/`, and have
  `infra-database` implement it — that's the smallest correct step, not a full-repo rewrite.
