import { DATABASE_URL } from "$env/static/private";
import { genDatabaseClient } from "infra-database";

export const database = genDatabaseClient(DATABASE_URL);
