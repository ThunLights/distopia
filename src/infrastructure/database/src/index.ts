import { PrismaPg } from "@prisma/adapter-pg";

import { DatabaseClient } from "./DatabaseClient";
import { PrismaClient } from "./prisma-client/client";

function genPrismaClient(databaseUrl: string) {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });
}

export function genDatabaseClient(databaseUrl: string) {
  return new DatabaseClient(genPrismaClient(databaseUrl));
}
