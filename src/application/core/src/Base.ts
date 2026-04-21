import type { PrismaClient } from "infra-database/prelude/prisma";

export type AppData = {
  database: PrismaClient;
};

export class Base {
  constructor(protected readonly appData: AppData) {}
}
