import { PrismaPg } from "@prisma/adapter-pg";

import { DatabaseClient } from "./DatabaseClient";
import { PrismaClient } from "./prisma-client/client";
import { setEncryptionKey } from "./TokenEncryption";

function genPrismaClient(databaseUrl: string) {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });
}

export function genDatabaseClient(databaseUrl: string, encryptionKey?: string) {
  if (encryptionKey) {
    setEncryptionKey(encryptionKey);
  }
  return new DatabaseClient(genPrismaClient(databaseUrl));
}

export { encrypt, decrypt } from "./TokenEncryption";
