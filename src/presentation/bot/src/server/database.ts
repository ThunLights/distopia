import { genDatabaseClient } from "infra-database";

const { DATABASE_URL } = process.env;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

export const database = genDatabaseClient(DATABASE_URL);
