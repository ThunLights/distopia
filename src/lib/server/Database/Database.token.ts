import { errorHandling } from "$lib/server/error";
import { tokenHash } from "$lib/hash";
import { randomString } from "$lib/random";

import type { Prisma } from "@prisma/client";
import type { DefaultArgs } from "@prisma/client/runtime/library";

export class Token {
    constructor(private readonly table: Prisma.TokenDelegate<DefaultArgs>) {
    }

    private async generateToken() {
        let token = randomString(70)
        while (await this.table.findFirst({ where: { token: tokenHash(token) } })) {
            token = randomString(70)
        }
        return token;
    }

	public async delete(userId: string) {
		try {
			await this.table.deleteMany({ where: { id: userId } });
			return true;
		} catch (error) {
			errorHandling(error);
			return false
		}
	}

    public async add(id: string): Promise<string> {
        const token = await this.generateToken();
        await this.table.create({
            data: {
                id,
                token: tokenHash(token),
            }
        });
        return token;
    }

    public async remove(content: string, selectorType: "id" | "token"): Promise<void> {
        const where: Prisma.TokenWhereInput = {};
        where[selectorType] = content;
        await this.table.deleteMany({ where })
    }

    public async tokenCheck(token: string) {
        try {
            const element = await this.table.findFirst({ where: { token: tokenHash(token) } });
            if (element) {
                return element.id;
            }
            return null
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }
}
