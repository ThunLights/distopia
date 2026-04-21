import { DATABASE_URL } from "$env/static/private";
import { genPrismaClient } from "infra-database";

export const database = genPrismaClient(DATABASE_URL);
