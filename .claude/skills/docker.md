---
description: Dockerfile and Docker Compose configuration, services, and operational patterns for distopia
---

# Docker Guide

## Service Overview

Defined in `docker/docker-compose.yml` (base), extended by `docker-compose.dev.yml` and `docker-compose.prod.yml`.

| Service | Container name | Image | Role |
|---|---|---|---|
| `db` | `distopia-db` | `postgres:17` | PostgreSQL database |
| `app` | `distopia-dev` (dev) / `distopia` (prod) | Built from `dockerfile` | App + bot runtime |

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
BOT_REDIRECT_URL=...
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

## Development vs Production Compose

| File | Use |
|---|---|
| `docker-compose.yml` | Base (shared services, volumes, networks) |
| `docker-compose.dev.yml` | Dev: exposes ports 5173, 4173, 6006; `command: sleep infinity` |
| `docker-compose.prod.yml` | Prod: runs `scripts/prod.sh`; only port 3000 exposed |

The devcontainer (`.devcontainer/devcontainer.json`) uses `docker-compose.yml` + `docker-compose.dev.yml`.

## Production Deploy

From outside the devcontainer, on the production host:

```bash
environment/production.sh
```

This runs `docker-compose.prod.yml`, which executes `scripts/prod.sh`:
1. `scripts/setup.sh` (install deps + `bun run setup`)
2. `bun run build`
3. `bun run src/presentation/web/build/index.js` (start the Node.js server)

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
