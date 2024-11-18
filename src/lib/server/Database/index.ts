import { PrismaClient } from "@prisma/client";

import { Token } from "./Database.token";
import { User } from "./Database.user";
import { Email } from "./Database.email";
import { Avatar } from "./Database.avatar";

class DatabaseClient {
    public readonly prisma = new PrismaClient();
    public readonly token = new Token(this.prisma.token);
    public readonly user = new User(this.prisma.user);
    public readonly email = new Email(this.prisma.email);
    public readonly avatar = new Avatar(this.prisma.avatar);

    constructor() {
    }
}

export const database = new DatabaseClient();
