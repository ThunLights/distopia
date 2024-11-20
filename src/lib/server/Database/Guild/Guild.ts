import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import type { UserElement } from "../Database.user";
import { errorHandling } from "$lib/server/error";
import { DatabaseError } from "../index";

export class GuildTable {
    constructor(private readonly table: Prisma.GuildDelegate<DefaultArgs>) {}

    public async userGuilds(user: UserElement) {
        try {
            const data = await this.table.findMany({
                where: {
                    userId: user.id,
                },
            });
            return data;
        } catch (error) {
            errorHandling(error);
            return new DatabaseError("ERROR")
        }
    }
}
