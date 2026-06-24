---
description: PostgreSQL 17 + Prisma 7 schema, migrations, and query patterns used in infra-database
---

# PostgreSQL + Prisma Guide

Package: `infra-database` — `src/infrastructure/database/`
ORM: Prisma 7 | DB: PostgreSQL 17 | Container: `distopia-db`

## Connection

The connection string is set via `DATABASE_URL` in `.env` at the monorepo root. See `.env.example` for the format.

`distopia-db` is the Docker service hostname. Port 5432 is mapped to `127.0.0.1:5432` on the host.

## Schema Location

`src/infrastructure/database/prisma/schema.prisma`

### Current Models

| Model | Primary Key | Notes |
|---|---|---|
| `User` | `userId` (String) | bump counter per user |
| `UserWeb` | `userId` | JWT verify key (Bytes, nullable) |
| `UserDiscord` | `userId` | OAuth2 access/refresh tokens, auto-updated `updatedAt` |
| `Friend` | `userId` | friend recruitment posts |
| `Guild` | `guildId` | registered Discord servers |
| `GuildReview` | `(userId, guildId)` | composite PK |
| `GuildRecordOneDay` | `(guildId, date)` | daily activity records |
| `GuildRecord` | `guildId` | aggregated stats (BigInt for level/point/rank) |
| `GuildSetting` | `guildId` | per-guild bot settings |
| `Panel` | `(guildId, type)` | ranking panel channel/message IDs |
| `JWTKey` | `id` (autoincrement) | signing keys, Bytes storage |

### Enums

```prisma
enum PanelType  { ActiveRateRanking  LevelRanking  UserBumpRanking }
enum JWTAlg     { HS256 }
```

## Generators

```prisma
generator client {
  provider        = "prisma-client"
  previewFeatures = ["typedSql"]
  moduleFormat    = "esm"
}

generator zod {
  provider = "zod-prisma-types"   // auto-generates Zod schemas from models
}
```

## Migrations Workflow

### Generate a new migration (inside devcontainer)

```bash
cd src/infrastructure/database
bunx prisma migrate dev --name <descriptive-name>
```

Creates a timestamped directory under `prisma/migrations/` with the SQL diff.

### Apply migrations

```bash
cd docker && docker compose exec app sudo bun run deploy-db
```

Runs `prisma migrate deploy` and regenerates the Prisma client.

### After any schema change — rebuild to regenerate types

```bash
cd docker && docker compose exec app sudo bun run build
```

### Format / validate schema

```bash
# format in place
docker compose exec app sh -c "cd src/infrastructure/database && bunx prisma format"

# validate only
docker compose exec app sh -c "cd src/infrastructure/database && bunx prisma validate"
```

## TypedSQL (Raw SQL Queries)

Raw SQL files live in `prisma/sql/`. They are compiled to typed functions during `prisma generate --sql`.

1. Add a `.sql` file to `prisma/sql/`
2. Run `bun run build` to generate typed wrappers
3. Import via `@prisma/client/sql`:

```typescript
import { getGuildWithRecord } from "@prisma/client/sql";
const result = await prisma.$queryRawTyped(getGuildWithRecord(guildId));
```

## Prisma Client Setup

The client is created with the `@prisma/adapter-pg` driver adapter (TCP connection to PostgreSQL):

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./prisma-client/client";

const client = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});
```

## Auto-generated Zod Schemas

`zod-prisma-types` generates Zod schemas from every Prisma model into `src/zod/`. Import them from `infra-database/types`:

```typescript
import type { GuildCreateInput } from "infra-database/types";
```

Never edit files in `src/zod/` or `src/prisma-client/` — they are regenerated on every build.

## Direct psql Access (inside devcontainer)

```bash
# Use the DATABASE_URL value from .env
psql "$DATABASE_URL"
```

Or using individual flags (values from `.env`):

```bash
psql -h distopia-db -U <DB_USER> -d <DB_NAME>
```

## Notes

- `BigInt` columns (`level`, `point`, `rank`) require `Number()` conversion before JSON serialization or arithmetic in JavaScript
- `DateTime @updatedAt` columns are managed by Prisma automatically — never set them manually
- `Bytes` columns (`jwtVerifyKey`, `key`) are stored as `Buffer` in Node.js/Bun
