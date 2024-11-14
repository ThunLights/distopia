import { PrismaClient } from "@prisma/client";

import { randomString } from "../random";
import { tokenHash } from "../hash";

import type { Prisma } from "@prisma/client";
import { Token } from "./Database.token";

class DatabaseClient {
    public readonly prisma = new PrismaClient();
    public readonly token = new Token(this.prisma);

    constructor() {}
}

export const database = new DatabaseClient();
