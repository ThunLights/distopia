import { DATABASE_URL } from "$env/static/private";
import { env } from "$env/dynamic/private";
import { genDatabaseClient } from "infra-database";

const encryptionKey: string | undefined = env.ENCRYPTION_KEY;

export const database = genDatabaseClient(DATABASE_URL, encryptionKey);
