import { env } from "$env/dynamic/private";
import { genDatabaseClient } from "infra-database";

export const database = genDatabaseClient(env.DATABASE_URL!);
