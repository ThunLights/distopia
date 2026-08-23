import { env } from "$env/dynamic/private";
import { requireEnv } from "./env";
import { genDatabaseClient } from "infra-database";

export const database = genDatabaseClient(requireEnv("DATABASE_URL", env.DATABASE_URL));
