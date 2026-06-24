---
description: Workflow for Prisma schema changes and database migrations
---

# Prisma Migration Workflow

## Schema Location

`src/infrastructure/database/prisma/schema.prisma`

ORM: Prisma 7 | DB: PostgreSQL 17 (container `distopia-db`)

## Full Workflow for a Schema Change

### 1. Edit the schema

Modify `src/infrastructure/database/prisma/schema.prisma` with the desired model or field changes.

### 2. Generate a migration file

Run inside the devcontainer (not via `docker compose exec` — this needs an interactive TTY):

```bash
cd src/infrastructure/database
bunx prisma migrate dev --name <descriptive-migration-name>
```

This creates a timestamped directory under `prisma/migrations/` with the SQL diff.

### 3. Apply the migration

```bash
cd docker && docker compose exec app sudo bun run deploy-db
```

This runs `prisma migrate deploy` and also regenerates the Prisma client.

### 4. Regenerate the Prisma client and TypeScript types

The `deploy-db` + `build` pipeline handles this automatically:

```bash
cd docker && docker compose exec app sudo bun run build
```

### 5. Run type check

```bash
cd docker && docker compose exec app sudo bun run typecheck
```

## Adding Raw SQL Queries (Prisma TypedSQL)

Raw SQL queries live in `prisma/sql/`. Each `.sql` file is compiled to a typed function during `prisma generate --sql`.

1. Add the `.sql` file to `src/infrastructure/database/prisma/sql/`
2. Run `bun run build` to regenerate typed query wrappers
3. Import the generated function from `@prisma/client/sql`

## Lint / Format the Schema

```bash
cd docker && docker compose exec app sh -c "cd src/infrastructure/database && bunx prisma format"
```

Validation only (no write):

```bash
cd docker && docker compose exec app sh -c "cd src/infrastructure/database && bunx prisma validate"
```

## Notes

- The `zod-prisma-types` package auto-generates Zod schemas from Prisma models during `build`
- Never edit the generated Zod types in `dist/` — regenerate via build instead
- Migration files in `prisma/migrations/` are committed to git and applied in order on production via `deploy-db`
