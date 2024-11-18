import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Email {
    constructor(private readonly table: Prisma.EmailDelegate<DefaultArgs>) {
    }

    public async data(id: string) {
        try {
            const data = await this.table.findFirst({ where: { id } });
            return data ? data.content : null;
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }

    public async update(id: string, email: string) {
        try {
            const element = await this.table.findFirst({ where: { id } });
            if (element) {
                await this.table.updateMany({
                    where: {
                        id: element.id
                    },
                    data: {
                        content: email,
                    }
                })
            } else {
                await this.table.create({
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
