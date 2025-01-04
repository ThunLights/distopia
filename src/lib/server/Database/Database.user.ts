import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export type UserElement = {
    id: string
    username: string
    accessToken: string
    refreshToken: string
    time: bigint
}

export class User {
    constructor(private readonly table: Prisma.UserDelegate<DefaultArgs>) {
    }

    public async data(id: string) {
        try {
            return await this.table.findFirst({ where: { id } });
        } catch (error) {
            errorHandling(error);
            return null
        }
    }

	public async delete(userId: string) {
		try {
			await this.table.deleteMany({
				where: {
					id: userId
				}
			})
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async aboutExpire() {
		try {
			const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
			return await this.table.findMany({
				where: {
					time: {
						lte: fiveDaysAgo,
					}
				}
			})
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

    public async update(id: string, username: string, accessToken: string, refreshToken: string) {
        try {
            const time = BigInt(Date.now());
            const element = await this.table.findFirst({
                where: { id }
            })
            if (element) {
                await this.table.updateMany({
                    where: {
                        id: element.id,
                    },
                    data: {
						username,
                        accessToken,
                        refreshToken,
                        time,
                    }
                })
            } else {
                await this.table.create({
                    data: {
                        id,
                        username,
                        accessToken,
                        refreshToken,
                        time,
                    }
                })
            }
            return true;
        } catch (error) {
            errorHandling(error)
            return false;
        }
    }
}
