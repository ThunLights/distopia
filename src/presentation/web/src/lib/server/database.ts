import { DATABASE_URL } from "$app/env/private";
import { genDatabaseClient } from "infra-database";

export const database = genDatabaseClient(DATABASE_URL!);
