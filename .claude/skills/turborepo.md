---
description: Turborepo pipeline configuration, task dependencies, caching, and monorepo task orchestration in distopia
---

# Turborepo Guide

Turborepo orchestrates build, test, lint, and typecheck tasks across all packages in the monorepo. Bun is the script runner; Turborepo handles dependency ordering and caching.

Config file: `turbo.json` at the monorepo root.

## Task Pipeline

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".svelte-kit/**"]
    },
    "test": {
      "dependsOn": ["build", "^test"],
      "cache": false
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "lint": {},
    "format": {}
  }
}
```

### `dependsOn` Syntax

| Value | Meaning |
|---|---|
| `"^build"` | All upstream workspace dependencies must complete `build` first |
| `"build"` | The same package's `build` task must complete first |
| `[]` | No dependencies — runs immediately |

### Cache Behavior

| Setting | Effect |
|---|---|
| `"cache": false` | Always re-run even if inputs haven't changed (used for `test`) |
| `"outputs"` | Directories to cache after a successful run; restored on cache hit |
| default | Caches based on input file hashes; skips if unchanged |

Turborepo cache is stored in the `distopia-cache` Docker volume inside the container.

## Running Tasks

All tasks run via `bun run <task>` at the monorepo root (from `docker/` on the host):

```bash
# Run a task across all packages (in dependency order)
cd docker && docker compose exec app sudo bun run build
cd docker && docker compose exec app bun run test
cd docker && docker compose exec app sudo bun run typecheck
cd docker && docker compose exec app sudo bun run lint
cd docker && docker compose exec app sudo bun run format
```

### Scope to a Specific Package

Use `--filter` to run a task in one package only:

```bash
cd docker && docker compose exec app bun run build -- --filter=infra-http
cd docker && docker compose exec app bun run test  -- --filter=presentation-bot
cd docker && docker compose exec app bun run lint  -- --filter=presentation-web
```

Or run the package script directly:

```bash
cd docker && docker compose exec app sh -c "cd src/infrastructure/http && bun run test"
```

## Package Script Lookup

Turborepo runs the script with the same name from each package's `package.json`. If a package has no `"build"` script, it is skipped for that task.

## Output Caching

Turborepo stores task outputs and restores them on subsequent runs if inputs (source files, env vars) haven't changed. This speeds up CI significantly — the first run is slow, subsequent runs hit the cache.

To force a full re-run (ignoring cache):

```bash
bun run build -- --force
```

## Adding a New Task to the Pipeline

1. Add the script to the relevant `package.json` files
2. Add the task definition to `turbo.json`:

```json
{
  "tasks": {
    "my-task": {
      "dependsOn": ["^build"],
      "outputs": ["generated/**"]
    }
  }
}
```

3. Run: `bun run my-task`

## Package Dependency Graph

Turborepo builds a dependency graph from `workspace:*` references in `package.json`. Example:

```
presentation-bot   → app-core, infra-discord, infra-database
presentation-web   → app-core, infra-database, infra-http
app-core           → infra-database, infra-discord, infra-http
infra-database     → (none)
infra-http         → (none)
```

`^build` means all packages in the graph above the current one must build first.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Task skipped unexpectedly | Run with `--force` to bypass cache |
| `No tasks found` | Check that `package.json` has the script name |
| Build cache stale after dependency change | Run `bun install` then `bun run build -- --force` |
| Test runs pass but E2E fail | `bun run build` first — `test` depends on `build` |
