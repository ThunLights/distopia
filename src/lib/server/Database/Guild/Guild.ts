import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";
import type { UserElement } from "../Database.user";
import { errorHandling } from "$lib/server/error";
import { DatabaseError } from "../index";

export type Guild = {
    name: string
    icon: string | null
    banner: string | null
    guildId: string
    userId: string
    invite: string
    category: string
    description: string
}

export class GuildTable {
    constructor(private readonly table: Prisma.GuildDelegate<DefaultArgs>) {}

	public async delete(guildId: string) {
		try {
			await this.table.deleteMany({ where: { guildId }});
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

    public async update(guild: Guild) {
        try {
			const element = await this.table.findFirst({ where: { guildId: guild.guildId }});
			if (element) {
				await this.table.updateMany({
					where: { guildId: guild.guildId },
					data: guild,
				});
			} else {
				await this.table.create({
					data: guild,
				})
			}
            return true;
        } catch (error) {
            errorHandling(error);
            return false;
        }
    }

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

    public async id2Data(id: string) {
        try {
            return await this.table.findFirst({ where: { guildId: id } });
        } catch (error) {
            errorHandling(error);
            return new DatabaseError("ERROR")
        }
    }
}
