---
description: Create a new Prisma database migration after editing the schema
---

Create a new Prisma migration. The schema change being made: $ARGUMENTS

## Steps

### 1. Edit the schema

Modify `src/infrastructure/database/prisma/schema.prisma` with the desired changes (add/remove models, fields, indexes, enums, etc.).

### 2. Format and validate

```bash
cd docker && docker compose exec app sh -c "cd src/infrastructure/database && bunx prisma format"
cd docker && docker compose exec app sh -c "cd src/infrastructure/database && bunx prisma validate"
```

### 3. Generate the migration file

Run **inside the devcontainer** (not via `docker compose exec` — this command is interactive):

```bash
# From inside the devcontainer shell
cd src/infrastructure/database
bunx prisma migrate dev --name <descriptive-migration-name>
```

Use kebab-case for the migration name describing what changed, e.g. `add-guild-setting-bump-channel` or `add-user-web-verify-key`.

This creates a new directory under `prisma/migrations/<timestamp>_<name>/` containing `migration.sql`.

### 4. Apply the migration

```bash
cd docker && docker compose exec app sudo bun run deploy-db
```

Runs `prisma migrate deploy` and regenerates the Prisma client.

### 5. Rebuild to regenerate TypeScript types

```bash
cd docker && docker compose exec app sudo bun run build
```

Regenerates:
- Prisma client types in `src/prisma-client/`
- Zod schemas in `src/zod/` (via `zod-prisma-types`)
- TypedSQL wrappers in `src/sql/` (if `.sql` files changed)

### 6. Type check

```bash
cd docker && docker compose exec app sudo bun run typecheck
```

## Notes

- Never edit files in `src/infrastructure/database/src/zod/` or `src/infrastructure/database/src/prisma-client/` — they are regenerated on build
- Migration files in `prisma/migrations/` are committed to git and must be applied in order on production via `deploy-db`
- `BigInt` columns (`level`, `point`, `rank`) require `Number()` conversion before JSON serialization
- `DateTime @updatedAt` is managed by Prisma — never set it manually
- `Bytes` columns (e.g. `jwtVerifyKey`, `key`) are stored as `Buffer` in Bun/Node.js

## TypedSQL (raw SQL queries)

To add a raw SQL query alongside schema changes:

1. Create `src/infrastructure/database/prisma/sql/<queryName>.sql`
2. Run `bun run build` to generate the typed wrapper
3. Import from `@prisma/client/sql`:

```typescript
import { myQuery } from "@prisma/client/sql";
const result = await prisma.$queryRawTyped(myQuery(param1, param2));
```
