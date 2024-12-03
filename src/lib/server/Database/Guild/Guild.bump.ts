import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class GuildBumpTable {
    constructor(private readonly table: Prisma.GuildBumpDelegate<DefaultArgs>) {}

	public async delete(guildId: string) {
		try {
			await this.table.deleteMany({ where: { id: guildId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

    async guilds(take: number): Promise<string[]> {
        try {
            const data = await this.table.findMany({
				orderBy: {
					time: "desc",
				},
				take,
			});
            return data.map(value => value.id);
        } catch (error) {
            errorHandling(error);
            return [];
        }
    }

    async update(id: string) {
        try {
            const element = await this.table.findFirst({ where: { id }});
            if (element) {
                await this.table.updateMany({
                    where: { id },
                    data: {
                        time: BigInt(Date.now()),
                    }
                })
            } else {
                await this.table.create({
                    data: {
                        id,
                        time: BigInt(Date.now()),
                    }
                })
            }
            return true;
        } catch (error) {
            errorHandling(error);
            return false;
        }
    }
}
