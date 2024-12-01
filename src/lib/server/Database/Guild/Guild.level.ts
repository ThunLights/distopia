import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export type LevelObj = {
	level: bigint
	point: bigint
}

export class GuildLevelTable {
    constructor(private readonly table: Prisma.GuildLevelDelegate<DefaultArgs>) {}

	private async levelUpCheck(level: bigint, point: bigint, plus: bigint): Promise<LevelObj> {
		const nextLvPt = level * 10n;
		const ptSum = point + plus;

		if (nextLvPt <= ptSum) {
			const remaining = ptSum - nextLvPt;
			return await this.levelUpCheck(level+1n, remaining, 0n);
		}

		return {
			level,
			point: ptSum,
		}
    }

	public async plus(guildId: string, content: bigint) {
        try {
            const element = await this.table.findFirst({ where: { guildId } });
            const lv = element ? await this.levelUpCheck(element.level, element.point, content) : await this.levelUpCheck(0n, 0n, content);
            if (element) {
                await this.table.updateMany({
                    where: { guildId },
                    data: lv,
                })
            } else {
                await this.table.create({
                    data: {...lv, ...{ guildId }}
                })
            }
            return lv;
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }

	public async delete(guildId: string) {
		try {
			await this.table.deleteMany({ where: { guildId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async data(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async ranking(take?: number) {
		try {
			return await this.table.findMany({
				orderBy: {
					level: "desc",
				},
				take: take ?? 50,
			})
		} catch (error) {
			errorHandling(error);
			return []
		}
	}
}
