import { PrismaClient } from "./prisma-client"
import { PrismaPg } from "@prisma/adapter-pg";

export function genPrismaClient(databaseUrl: string) {
    return new PrismaClient({
        adapter: new PrismaPg({
            connectionString: databaseUrl,
        })
    })
}
