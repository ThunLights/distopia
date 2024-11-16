import { errorHandling } from "$lib/server/error";

import type { PrismaClient } from "@prisma/client";

export class Email {
    constructor(private readonly prisma: PrismaClient) {
    }

    public async data(id: string) {
        try {
            const data = await this.prisma.email.findFirst({ where: { id } });
            return data ? data.content : null;
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }

    public async update(id: string, email: string) {
        try {
            const element = await this.prisma.email.findFirst({ where: { id } });
            if (element) {
                await this.prisma.email.updateMany({
                    where: {
                        id: element.id
                    },
                    data: {
                        content: email,
                    }
                })
            } else {
                await this.prisma.email.create({
                    data: {
                        id,
                        content: email,
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
