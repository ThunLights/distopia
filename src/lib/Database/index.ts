import { PrismaClient } from "@prisma/client";

import { Token } from "./Database.token";
import { User } from "./Database.user";
import { Email } from "./Database.email";
import { Avatar } from "./Database.avatar";

class DatabaseClient {
    public readonly prisma = new PrismaClient();
    public readonly token = new Token(this.prisma);
    public readonly user = new User(this.prisma);
    public readonly email = new Email(this.prisma);
    public readonly avatar = new Avatar(this.prisma);

    constructor() {
    }
}

export const database = new DatabaseClient();
