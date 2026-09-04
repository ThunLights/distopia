---
description: SOLID principles (SRP, OCP, LSP, ISP, DIP) applied to distopia's TypeScript codebase, with real examples and a known gap in DIP
---

# SOLID Principles

TypeScript examples grounded in this repo. See also [[dry]], [[ddd]], [[clean-architecture]].

## S — Single Responsibility Principle

A class/module should have one reason to change.

Good example already in the repo: `src/infrastructure/http` does exactly one thing (safe
outbound HTTP) and nothing else — `safeFetch`, `SafeUrl`, DNS pinning, redirect handling all
live together because they're one responsibility (SSRF-safe fetching), not because they're
convenient to bundle. It has zero dependencies besides `zod`.

Watch for: a Discord interaction handler class (`ChatInputCommandInteractionBase` subclass)
that both parses options *and* contains business logic *and* formats the Discord reply. Keep
`parseOptions()` (validation) separate from `exec()` (business logic) — that split is already
the convention (see `.claude/skills/discord-interaction.md`).

## O — Open/Closed Principle

Open for extension, closed for modification.

This is the actual design of the bot's interaction system: adding a new slash command means
*adding a new class* under `ChatInputCommand/`, never editing the router or the base class.
`*.auto.ts` files regenerate the registry from whatever classes exist — the dispatch mechanism
never needs to change when a command is added or removed.

```typescript
// Adding a command extends the system without modifying it
export class MyNewCommand extends ChatInputCommandInteractionBase {
  public override commandName = "my-new-command";
  protected override async exec(interaction: ChatInputCommandInteraction<CacheType>) { /* ... */ }
}
// bun run build regenerates ChatInputCommands.auto.ts — no other file touched
```

## L — Liskov Substitution Principle

A subclass must be usable anywhere its base type is expected, without surprising behavior.

The interaction base classes (`ButtonInteractionBase`, `ModalInteractionBase`,
`StringSelectMenuInteractionBase`, etc.) are all invoked polymorphically by
`InteractionCreateHandler` — it never checks `instanceof` on a concrete subclass. Any subclass
that, say, throws instead of returning a `ValidationError`, or skips calling
`interaction.reply`/`interaction.update` in the way its sibling classes do, violates LSP and
will break the router's assumptions.

## I — Interface Segregation Principle

Don't force a consumer to depend on methods it doesn't use.

`ValidateResult<T> = T | ValidationError` (in `presentation-bot`'s `utils/validator.ts`) is a
minimal, single-purpose contract — callers only ever need to check `instanceof
ValidationError`, nothing else. Contrast with `DatabaseClient` (from `infra-database`), which
is a wide interface (every table's client) — that's fine for `AppState` (which legitimately
needs broad DB access), but a service class that only ever touches `guild` rows shouldn't take
the whole `DatabaseClient` as a constructor parameter if a narrower type will do.

## D — Dependency Inversion Principle

High-level modules shouldn't depend on low-level modules; both should depend on abstractions.

**This one is a known gap in the current codebase — don't assume it's already in place.**
`src/application/core`'s `AppState` (`src/application/core/src/AppState.ts`) depends directly
on concrete types from `infra-database` (`DatabaseClient`) and `repo-search`'s `SearchEngine`
— not on an abstraction defined in `domain/`. `domain-model` itself even depends on
`infra-discord` (`src/domain/model/src/Guild.ts` re-exports `infra-discord`'s `Guild` type),
which is backwards from what DIP prescribes (domain should depend on nothing).

This is an accepted, established pattern here — **do not** try to retrofit interfaces into
existing code as a drive-by refactor (see [[clean-architecture]] and this repo's "no
backwards-compatibility hacks / don't refactor beyond what's asked" guidance in `CLAUDE.md`).
If you're adding genuinely new code that needs to swap implementations (e.g. a new external
integration with a test double), define a narrow interface next to the consumer and inject
the concrete implementation — don't reach for DIP as a default, only when there's a real need
to substitute implementations.
