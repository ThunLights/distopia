import { errorHandling } from "$lib/error";

import type { PrismaClient } from "@prisma/client";

export class Avatar {
    constructor(private readonly prisma: PrismaClient) {
    }

    public async data(id: string) {
        try {
            const data = await this.prisma.avatar.findFirst({ where: { id } });
            return data ? data.content : null;
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }

    public async update(id: string, avatar: string) {
        try {
            const element = await this.prisma.avatar.findFirst({ where: { id } });
            if (element) {
                await this.prisma.avatar.updateMany({
                    where: {
                        id: element.id
                    },
                    data: {
                        content: avatar,
                    }
                })
            } else {
                await this.prisma.avatar.create({
                    data: {
                        id,
                        content: avatar,
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
