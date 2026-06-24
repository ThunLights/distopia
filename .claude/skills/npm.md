---
description: npm usage in this project — publishing, workspace protocol, and catalog versioning
---

# npm Guide

This project uses **Bun** as the primary package manager for development. npm is used for **publishing** the public library (`lib/distopia`) and is available globally in the container.

## When npm is Used vs Bun

| Task | Tool |
|---|---|
| Install dependencies | `bun install` / `bun ci` |
| Run scripts | `bun run <script>` |
| Publish `lib/distopia` to npm registry | `npm publish` (via `scripts/npm-publish.sh`) |
| Publish `lib/distopia` to JSR | `bunx jsr publish` (via `scripts/jsr-version.sh`) |
| Bootstrap global tools in Dockerfile | `npm i -g bun npm@<version> @antfu/ni` |

## Publishing `lib/distopia`

```bash
# From the project root (handled by CI / release maintainers)
scripts/npm-publish.sh [--dry-run]
```

The script:
1. Reads `name` and `version` from `lib/distopia/package.json`
2. Checks if `<name>@<version>` already exists on the npm registry — skips if so
3. Packs with `bun pm pack`
4. Publishes with `npm publish --provenance --access public`

## Workspace Protocol

Inter-package dependencies use the `workspace:*` protocol in `package.json`:

```json
{
  "dependencies": {
    "app-core": "workspace:*",
    "infra-database": "workspace:*"
  }
}
```

Bun resolves `workspace:*` to the local package. This is standard Bun/pnpm workspace syntax and does not require npm workspaces to be configured separately.

## Catalog Versioning

Shared dependency versions are pinned in the root `package.json` under `workspaces.catalog`:

```json
{
  "workspaces": {
    "catalog": {
      "typescript": "6.0.3",
      "vitest": "4.1.8",
      "zod": "4.4.3"
    }
  }
}
```

Packages reference these as `"typescript": "catalog:"` — Bun substitutes the pinned version at install time. To update a shared dependency, change the version in `catalog` and run `bun install`.

## `@antfu/ni` — Universal Package Manager Wrapper

`ni` is installed globally and proxies commands to the correct package manager:

```bash
ni           # → bun install
nr build     # → bun run build
nlx prisma   # → bunx prisma
```

Useful when running scripts that don't know which package manager the project uses.

## npm Scripts in Individual Packages

Each package's `package.json` defines its own scripts. They are orchestrated by Turborepo at the monorepo level. Run a specific package script directly:

```bash
docker compose exec app sh -c "cd src/presentation/web && npm run lint"
# or equivalently:
docker compose exec app sh -c "cd src/presentation/web && bun run lint"
```

The web package's `package.json` uses `npm run` internally (e.g. `"test": "npm run test:unit -- --run && npm run test:e2e"`) — this works because both npm and bun are available.
