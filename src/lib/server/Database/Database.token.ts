import { errorHandling } from "$lib/server/error";
import { tokenHash } from "$lib/hash";
import { randomString } from "$lib/random";

import type { Prisma, PrismaClient } from "@prisma/client";

export class Token {
    constructor(private readonly prisma: PrismaClient) {
    }

    private async generateToken() {
        let token = randomString(70)
        while (await this.prisma.token.findFirst({ where: { token: tokenHash(token) } })) {
            token = randomString(70)
        }
        return token;
    }

    public async add(id: string): Promise<string> {
        const token = await this.generateToken();
        await this.prisma.token.create({
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
        await this.prisma.token.deleteMany({ where })
    }

    public async tokenCheck(token: string) {
        try {
            const element = await this.prisma.token.findFirst({ where: { token: tokenHash(token) } });
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
