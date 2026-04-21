import type { PrismaClient } from "infra-database/prelude/prisma";

export type AppData = {
  owner: {
    id: string;
  };
  database: PrismaClient;
};
