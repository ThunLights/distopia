---
description: How to run commands in this project's devcontainer environment
---

# Devcontainer Command Reference

All development happens **inside the devcontainer**. Running directly on the host is not supported.

## Running Commands

All commands use `docker compose exec` from the `docker/` directory on the host:

```bash
cd docker && docker compose exec app sudo bun run <script>
```

| Task | Command |
|---|---|
| Build all | `docker compose exec app sudo bun run build` |
| Type check | `docker compose exec app sudo bun run typecheck` |
| Lint | `docker compose exec app sudo bun run lint` |
| Format | `docker compose exec app sudo bun run format` |
| Tests | `docker compose exec app bun run test` |
| Apply DB migrations | `docker compose exec app sudo bun run deploy-db` |

## Per-Package Commands

To scope a command to one package, `cd` into it inside the container:

```bash
docker compose exec app sh -c "cd src/presentation/bot && bun run <script>"
docker compose exec app sh -c "cd src/presentation/web && bun run <script>"
docker compose exec app sh -c "cd src/infrastructure/database && bun run <script>"
```

## Dev Servers

| Port | Purpose |
|---|---|
| 5173 | Vite dev server (SvelteKit) |
| 4173 | Vite preview |
| 3000 | Production build preview |
| 6006 | Storybook |

Start the web dev server:

```bash
docker compose exec app sh -c "cd src/presentation/web && bun run dev"
```

Start Storybook:

```bash
docker compose exec app sh -c "cd src/presentation/web && bun run storybook"
```

## First-Time Setup

```bash
# On the host (once only, before starting the devcontainer)
docker volume create distopia-db-store

# Inside the devcontainer after it starts
sudo scripts/setup.sh
```

`setup.sh` installs dependencies and runs `bun run setup` (DB migration + build).

## Environment Variables

| File | Purpose |
|---|---|
| `.env` | Application code (bot token, DB URL, etc.) |
| `docker/.env` | Container port forwarding |

Copy `.env.example` to `.env` and fill in values before starting the container.
