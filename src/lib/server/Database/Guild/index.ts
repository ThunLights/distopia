import { PrismaClient } from "@prisma/client";

import { GuildTable } from "./Guild";
import { GuildTagTable } from "./Guild.tag";
import { GuildReviewTable } from "./Guild.review";
import { GuildLevelTable } from "./Guild.level";

export class DatabaseGuildTables {
    public readonly guild: GuildTable
    public readonly tag: GuildTagTable
    public readonly review: GuildReviewTable
    public readonly level: GuildLevelTable

    constructor(private readonly prisma: PrismaClient) {
        this.guild = new GuildTable(this.prisma.guild);
        this.tag = new GuildTagTable(this.prisma.guildTag);
        this.review = new GuildReviewTable(this.prisma.guildReview);
        this.level = new GuildLevelTable(this.prisma.guildLevel);
    }
}
