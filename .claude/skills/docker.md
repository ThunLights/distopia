---
description: Dockerfile and Docker Compose configuration, services, and operational patterns for distopia
---

# Docker Guide

## Service Overview

Defined in `docker/docker-compose.yml` (base), extended by `docker-compose.dev.yml` for the
devcontainer. There is no prod compose file — the production image is built from
`docker/dockerfile.prod` directly (see "Production Image" below); docker-compose is a
dev-only concern.

| Service | Container name | Image | Role |
|---|---|---|---|
| `db` | `distopia-db` | `postgres:17` | PostgreSQL database (dev only — production uses CloudNativePG, see `k8s/README.md`) |
| `app` | `distopia-dev` | Built from `dockerfile` | Devcontainer app + bot runtime |

### Volumes

| Volume | Purpose |
|---|---|
| `distopia-db-store` | PostgreSQL data — **external**, must be created once with `docker volume create distopia-db-store` |
| `distopia-cache` | Turborepo / Bun cache (anonymous) |
| `distopia-node-modules` | `node_modules` (anonymous, avoids host/container conflicts) |

The project source is bind-mounted: `..:/workspaces/distopia:cached`

## Dockerfile (`docker/dockerfile`)

Base image: `ubuntu:24.04`

Key build stages:
1. Install system packages via `apt-get` (curl, git, golang, postgresql-client, sudo, etc.)
2. Fix `ubuntu` user UID/GID to match `USER_UID` build arg (default 1000) for bind mount compatibility
3. Configure passwordless sudo for `ubuntu`
4. Upgrade Node.js to pinned version via `n`; remove distro Node/npm
5. Install global npm packages: `bun`, `npm@<version>`, `@antfu/ni`
6. Install `trufflehog` (secret scanner) via install script
7. Build and install `gitleaks` (secret scanner) from source via `go build`
8. Install `jq` binary directly from GitHub releases
9. Switch to `ubuntu` user

### Build ARGs (pinned versions)

| ARG | Default |
|---|---|
| `NODE_VERSION` | `24.18.0` |
| `NPM_VERSION` | `11.17.0` |
| `JQ_VERSION` | `1.8.1` |
| `GITLEAKS_VERSION` | `8.30.1` |
| `TRUFFLEHOG_VERSION` | `3.95.6` |

To update a tool version, change the ARG value in `docker/dockerfile` and rebuild the image.

### Rebuilding the image

```bash
cd docker && docker compose build
```

Or force a full rebuild without cache:

```bash
cd docker && docker compose build --no-cache
```

## Environment Variable Files

| File | Purpose |
|---|---|
| `.env` (project root) | App runtime: bot token, DB URL, public URLs, role IDs |
| `docker/.env` | Container port forwarding |

**Never delete, overwrite, or move either file.** Both are gitignored -- there is no git
history and no guaranteed backup to recover their real values from if lost. Edit in place;
if you need a clean-slate copy, write it under a different filename next to
`.env.example`, never over the real file.

### `docker/.env` variables

```
PROD_PORT=3000      # host port for production build preview
DEV_PORT=5173       # Vite dev server
PREVIEW_PORT=4173   # Vite preview
DB_USER=user
DB_PW=0000
DB_NAME=distopia
```

### `.env` variables (app)

```
DATABASE_URL=<see .env at project root>
BOT_TOKEN=...
BOT_SECRET=...
PUBLIC_BOT_ID=...
PUBLIC_URL=...
PUBLIC_OWNER_ID=...
PUBLIC_HOME_SERVER_ID=...
# ... role IDs
```

## Common Docker Commands

```bash
# Start the devcontainer stack (from docker/)
docker compose up -d

# Stop
docker compose down

# Rebuild and restart
docker compose up -d --build

# View logs
docker compose logs -f app
docker compose logs -f db

# Open a shell inside the app container
docker compose exec -it app bash

# Run a one-off command in the container
docker compose exec app sudo bun run build

# Check running containers
docker compose ps

# Inspect a volume
docker volume inspect distopia-db-store
```

## Development Compose

| File | Use |
|---|---|
| `docker-compose.yml` | Base (shared services, volumes, networks) |
| `docker-compose.dev.yml` | Dev: exposes ports 5173, 4173, 6006; `command: sleep infinity` |

The devcontainer (`.devcontainer/devcontainer.json`) uses `docker-compose.yml` + `docker-compose.dev.yml`.

## Production Image (`docker/dockerfile.prod`)

A separate, self-contained multi-stage Dockerfile — not part of docker-compose, and not the
devcontainer image. Bakes `bun install` + `bun run build` at image-build time, so the
container just runs `bun run src/presentation/web/build/index.js` on start — no
install/build/migrate at container startup. The app reads its own config (`BOT_TOKEN`,
`PUBLIC_*`, `DATABASE_URL`, ...) via `$env/dynamic/*` + `dotenv` (see `hooks.server.ts`),
resolved at container start from real env vars/a mounted `.env` — none of it is baked into
the image. The build itself still needs a *separate*, build-time-only `.env` (just
`DATABASE_URL` + `SENTRY_*`) because `prisma generate --sql` needs to introspect a real
database and the Sentry vite plugin needs org/project/token for sourcemap upload; that file
is deleted before the runtime layer is created.

```bash
# build context must be the repo root
docker build -f docker/dockerfile.prod -t distopia:local .
```

## Production Deploy

Production runs on k3s and deploys automatically via GitOps (Argo CD + Argo Workflows +
Argo Events) on every push to `main` — the Workflow builds `docker/dockerfile.prod` with
Kaniko, runs `prisma migrate deploy`, pushes to an in-cluster registry, and Argo CD rolls
the Deployment. See `k8s/README.md` for the full pipeline, secrets, and one-time cluster
bootstrap. `.github/workflows/ci.yml`'s `e2e-prod` job builds/runs the same
`docker/dockerfile.prod` image directly with `docker build`/`docker run` (no k8s) to
smoke-test it in CI.

## Networking

All services share the `distopia-network` bridge network. Services communicate by container name:
- App → DB: `distopia-db:5432`
- All host-facing ports are bound to `127.0.0.1` only (not `0.0.0.0`) for security.

## First-Time Setup

```bash
# 1. On the host (once only)
docker volume create distopia-db-store

# 2. Start the stack
cd docker && docker compose up -d

# 3. Inside the devcontainer
sudo scripts/setup.sh
```
