import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./prisma-client";

export function genPrismaClient(databaseUrl: string) {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });
}
