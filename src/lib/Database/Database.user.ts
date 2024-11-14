import { errorHandling } from "$lib/error";

import type { PrismaClient } from "@prisma/client";

export class User {
    constructor(private readonly prisma: PrismaClient) {
    }

    public async update(id: string, username: string, accessToken: string, refreshToken: string) {
        try {
            const time = BigInt(Date.now());
            const element = await this.prisma.user.findFirst({
                where: { id, username }
            })
            if (element) {
                await this.prisma.user.updateMany({
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
                await this.prisma.user.create({
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
