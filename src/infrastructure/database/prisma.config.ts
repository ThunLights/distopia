import { join } from "path";

import { config } from "dotenv";

config({
  path: join(process.cwd(), "../../../.env"),
});

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  typedSql: {
    path: "prisma/sql",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
