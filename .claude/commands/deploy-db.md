---
description: Apply pending Prisma database migrations
---

Apply all pending migrations to the PostgreSQL database:

```bash
cd docker && docker compose exec app sudo bun run deploy-db
```

This runs `prisma migrate deploy` inside the `infra-database` package.

**After changing `src/infrastructure/database/prisma/schema.prisma`**, you must:
1. Create a new migration file in `src/infrastructure/database/prisma/migrations/`
2. Run this command to apply it

To generate a new migration (inside the devcontainer):

```bash
cd src/infrastructure/database && bunx prisma migrate dev --name <migration-name>
```

Then apply with `deploy-db`.
