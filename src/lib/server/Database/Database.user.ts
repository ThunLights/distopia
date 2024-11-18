import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

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

    public async update(id: string, username: string, accessToken: string, refreshToken: string) {
        try {
            const time = BigInt(Date.now());
            const element = await this.table.findFirst({
                where: { id, username }
            })
            if (element) {
                await this.table.updateMany({
                    where: {
                        id: element.id,
                        username: element.username,
                    },
                    data: {
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
