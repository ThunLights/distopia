import { existsSync } from "fs";
import { join } from "path";

import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

const dotenvPath = join(process.cwd(), "../../../.env");

if (existsSync(dotenvPath)) {
  config({
    path: dotenvPath,
  });
}

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
