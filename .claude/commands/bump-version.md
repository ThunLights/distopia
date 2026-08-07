---
description: Bump a pinned dependency version consistently across every location that pins it
---

Bump the dependency version given in $ARGUMENTS (format: `<package-name> <new-version>`, e.g. `bun 1.3.15` or `playwright 1.62.0`).

Follow the **Dependency Version Pins** table in `CLAUDE.md` — a single version lives in multiple places, and all of them must move together. Do not stop after the first match; grep the whole repo for the old version string before declaring the bump complete.

## Steps

1. **Find the current version.** Grep the repo for the package name to locate every file that pins it (`package.json` files, root `workspaces.catalog`, `packageManager`, `lib/distopia/jsr.json`, `docker/dockerfile`, `.github/workflows/*.yml`). Confirm the exact old version string before replacing it — do not assume it matches across files, since e.g. `playwright` in `docker/dockerfile`'s `PLAYWRIGHT_VERSION` must match `playwright` in `src/presentation/web/package.json`, not necessarily the catalog.

2. **Update every pin location that applies to this package:**
   - **Per-package `package.json`** — direct dependency entries matching `<package-name>` (skip entries already set to `"catalog:"`).
   - **Root `package.json` → `workspaces.catalog`** — if the package is a catalog entry, bump it here. This is the source of truth for every package consuming it via `"catalog:"`.
   - **Root `package.json` → `packageManager`** — only when bumping `bun`; format is `bun@<version>`, must equal the catalog `bun` version.
   - **`lib/distopia/jsr.json` → `imports`** — duplicate pin for JSR publishing (`oxfmt`, `oxlint`, `tsdown`, `jsr`, `zod`, `@types/node`); must match `lib/distopia/package.json` / the catalog.
   - **`docker/dockerfile` → `ARG ..._VERSION`** — only for tools baked into the devcontainer image (`BUN_VERSION`, `NODE_VERSION`, `NPM_VERSION`, `JQ_VERSION`, `GITLEAKS_VERSION`, `TRUFFLEHOG_VERSION`, `PLAYWRIGHT_VERSION`). `BUN_VERSION` must match the catalog `bun` version; `PLAYWRIGHT_VERSION` must match `playwright` in `src/presentation/web/package.json`.
   - **`.github/workflows/*.yml` → `bun-version`** — only for `bun`. Every `bun-version:` value across every workflow (`release.yml` currently pins it in 3 places, `preview.yml` in 1) must match the catalog `bun` version — including replacing a stray `bun-version: latest` if you find one, since CLAUDE.md requires CI-pinned `bun` to track the catalog exactly, not float.

3. **Refresh the lockfile** inside the devcontainer (never on the host — the pre-commit hook needs `sudo`, which only works in-container):

   ```bash
   cd docker && docker compose exec app sudo bun install
   ```

4. **Verify nothing broke:**

   ```bash
   cd docker
   docker compose exec app sudo bun run typecheck
   docker compose exec app sudo bun run lint
   docker compose exec app sudo bun run build
   ```

5. **Re-grep for the old version string** across the whole repo (excluding `bun.lock`, which will legitimately still reference transitive packages at other versions) to confirm no pin location was missed.

## Notes

- If `<package-name>` isn't a catalog entry, skip the catalog/`packageManager`/jsr.json steps that don't apply to it — don't touch unrelated files.
- Report back a summary table of every file changed and old → new version, so it's easy to sanity-check before committing.
- Do not commit automatically — stop after verification so the user can review the diff. Use `/open-pr` afterward to commit and open the pull request.
