import { PrismaClient } from "@prisma/client";

class DatabaseClient {
    public readonly prisma = new PrismaClient();

    constructor() {}
}

export const database = new DatabaseClient();
