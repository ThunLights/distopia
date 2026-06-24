---
description: Bun runtime, package manager commands, and workspace conventions used in distopia
---

# Bun Guide

Version: **1.3.13** (pinned in `workspaces.catalog` and installed globally in the Docker image)
Package manager for the monorepo. Also used as a script runner and TypeScript executor.

## Core Commands

```bash
# Install all workspace dependencies (respects lockfile)
bun install

# Strict install from lockfile (used in setup scripts — equivalent to npm ci)
bun ci

# Run a script defined in package.json
bun run <script>

# Execute a TypeScript file directly (no compile step)
bun run scripts/cmdGen.ts

# Execute a binary from node_modules
bunx prisma migrate dev

# Pack a package for publishing
bun pm pack

# Add a dependency
bun add <package>

# Add a dev dependency
bun add -d <package>
```

## Running Commands in the Container

All `bun run` commands in this project go through Docker:

```bash
# From the docker/ directory on the host
docker compose exec app sudo bun run build
docker compose exec app bun run test

# Scope to a specific package
docker compose exec app sh -c "cd src/presentation/web && bun run dev"
```

## Workspace Resolution

Bun uses `workspaces.packages` in the root `package.json` to discover packages:

```json
{
  "workspaces": {
    "packages": ["./lib/*", "./src/**/*"]
  }
}
```

Inter-package imports use `workspace:*`:

```json
{ "dependencies": { "app-core": "workspace:*" } }
```

Bun resolves these to the local package directory at install time.

## Catalog Pinning

Shared dependency versions are defined once in `workspaces.catalog`:

```json
{
  "workspaces": {
    "catalog": {
      "typescript": "6.0.3",
      "vitest": "4.1.8",
      "zod": "4.4.3",
      "bun": "1.3.13"
    }
  }
}
```

Individual packages reference them as `"vitest": "catalog:"`. To upgrade a shared dep, update the catalog entry and run `bun install`.

## TypeScript Execution

Bun runs TypeScript directly without a separate compile step:

```bash
bun run scripts/cmdGen.ts   # runs the bot command code-gen script
```

This is used for all internal tooling scripts.

## `bun ci` vs `bun install`

| Command | Behavior |
|---|---|
| `bun install` | Install deps, update lockfile if needed |
| `bun ci` | Strict install — fails if lockfile would change (used in `scripts/install.sh`) |

`scripts/install.sh` runs `bun ci` after wiping `node_modules`, ensuring a clean, reproducible install.

## Bun vs Node.js Compatibility

Bun implements the Node.js API surface. All Node.js built-ins (`crypto`, `fs`, `Buffer`, etc.) work in Bun without any changes. The production SvelteKit server (`build/index.js`) is started with `bun run` directly.

## Lockfile

`bun.lock` at the monorepo root. Commit this file — it pins exact resolved versions for reproducible installs.

## Turborepo Integration

Bun is the script runner; Turborepo orchestrates task execution order and caching:

```bash
# Turborepo runs "build" in dependency order across all packages
bun run build   # → turbo run build
```

Turborepo cache is stored in `distopia-cache` volume inside the container.

## Updating Bun

1. Change `"bun": "<new-version>"` in `workspaces.catalog` (root `package.json`)
2. Update `ARG BUN_VERSION` if added to the Dockerfile (currently installed via `npm i -g bun`)
3. Run `bun install` to update the lockfile
4. Rebuild the Docker image: `cd docker && docker compose build`
