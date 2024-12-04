import { PrismaClient } from "@prisma/client";

import { GuildTable } from "./Guild";
import { GuildTagTable } from "./Guild.tag";
import { GuildReviewTable } from "./Guild.review";
import { GuildLevelTable } from "./Guild.level";
import { GuildBumpTable } from "./Guild.bump";
import { GuildInviteTempTable } from "./Guild.tmp";
import { GuildNSFWTable } from "./Guild.nsfw";
import { GuildActiveRateTable } from "./Guild.activeRate";
import { GuildNewMemberTable } from "./Guild.newMember";
import { GuildNewMessageTable } from "./Guild.newMessage";

export class DatabaseGuildTables {
    public readonly guild: GuildTable
    public readonly tag: GuildTagTable
    public readonly review: GuildReviewTable
    public readonly level: GuildLevelTable
    public readonly bump: GuildBumpTable
    public readonly tmp: GuildInviteTempTable
	public readonly nsfw: GuildNSFWTable
	public readonly activeRate: GuildActiveRateTable
	public readonly newMessage: GuildNewMessageTable
	public readonly newMember: GuildNewMemberTable

    constructor(private readonly prisma: PrismaClient) {
        this.guild = new GuildTable(this.prisma.guild);
        this.tag = new GuildTagTable(this.prisma.guildTag);
        this.review = new GuildReviewTable(this.prisma.guildReview);
        this.level = new GuildLevelTable(this.prisma.guildLevel);
        this.bump = new GuildBumpTable(this.prisma.guildBump);
        this.tmp = new GuildInviteTempTable(this.prisma.guildTmp);
		this.nsfw = new GuildNSFWTable(this.prisma.guildNSFW);
		this.activeRate = new GuildActiveRateTable(this.prisma.guildActiveRate);
		this.newMessage = new GuildNewMessageTable(this.prisma.guildNewMessage);
		this.newMember = new GuildNewMemberTable(this.prisma.guildNewMember);
    }
}
