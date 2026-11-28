---
name: npm
description: npm usage in this project — publishing, workspace protocol, and catalog versioning
---

# npm Guide

This project uses **Bun** as the primary package manager for development. npm is used for **publishing** the public library (`lib/distopia`) and is available globally in the container.

## When npm is Used vs Bun

| Task | Tool |
|---|---|
| Install dependencies | `bun install` / `bun ci` |
| Run scripts | `bun run <script>` |
| Publish `lib/distopia` to npm registry | `npm publish` (via `changeset publish` in CI) |
| Publish `lib/distopia` to JSR | `npx jsr publish` (CI; `scripts/jsr-version.sh` syncs `jsr.json`'s version) |
| Bootstrap global tools in Dockerfile | `npm i -g bun npm@<version> @antfu/ni` |

## Publishing `lib/distopia`

Driven by `changesets/action` v2 in `.github/workflows/release.yml`, with no publish script of
our own. On `main` it opens the "Version Packages" PR while changesets are pending; after that PR
merges it runs `npx changeset publish`, which `npm publish`es every version not yet on npm
(trusted publishing via OIDC, no token; provenance is automatic) and reports the new git tags
through `CHANGESETS_OUTPUT`, so the action pushes them and creates the GitHub Releases. A
following step runs `npx jsr publish` (it skips a version already on JSR). PRs only run
`npm pack --dry-run` and `npx jsr publish --dry-run --allow-dirty`.

Because `changeset publish` uses plain `npm publish`, which does not rewrite `catalog:` or
`workspace:` ranges, `lib/distopia/package.json` pins concrete versions instead of `catalog:`.

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
