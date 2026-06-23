# Contributing Guide

## Environment

- `.env` - for code
- `docker/.env` - for container port forwarding

Please develop using a dev container.
The configuration is located in `.devcontainer/devcontainer.json`.

Please execute the following command prior to running the devcontainer.

```console
docker volume create distopia-db-store
```

## Setup

```
sudo scripts/setup.sh
```

## Scripts

### Build

```
sudo bun run build
```

### Typecheck

```
sudo bun run typecheck
```

### Formatter

```
sudo bun run format
```

### Lint

```
sudo bun run lint
```

### Deploy-db

```
sudo bun run deploy-db
```

## for Production

Execute following command outside of devcontainer.

```
environment/production.sh
```
