import { errorHandling } from "$lib/server/error";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Staff {
    constructor(private readonly table: Prisma.StaffDelegate<DefaultArgs>) {
    }

    public async check(id: string) {
        try {
            return await this.table.findFirst({ where: { id }});
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }
}
