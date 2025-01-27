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
import { GuildVcMemberSum } from "./Guild.vcMemberSum";
import { GuildVcMemberUpperTwo } from "./Guild.vcMemberUpperTwo";
import { BlackList } from "./Guild.blackList";
import { DatabaseGuildSettingsTables } from "./Settings/index";
import { BumpCounter } from "./Guild.bumpCounter";
import { DatabaseClient } from "../index";

export class DatabaseGuildTables {
	public readonly guild = new GuildTable(DatabaseClient._prisma.guild);
	public readonly tag = new GuildTagTable(DatabaseClient._prisma.guildTag);
	public readonly review = new GuildReviewTable(DatabaseClient._prisma.guildReview);
	public readonly level = new GuildLevelTable(DatabaseClient._prisma.guildLevel);
	public readonly bump = new GuildBumpTable(DatabaseClient._prisma.guildBump);
	public readonly tmp = new GuildInviteTempTable(DatabaseClient._prisma.guildTmp);
	public readonly nsfw = new GuildNSFWTable(DatabaseClient._prisma.guildNSFW);
	public readonly activeRate = new GuildActiveRateTable(DatabaseClient._prisma.guildActiveRate);
	public readonly newMessage = new GuildNewMessageTable(DatabaseClient._prisma.guildNewMessage);
	public readonly newMember = new GuildNewMemberTable(DatabaseClient._prisma.guildNewMember);
	public readonly vcMemberSum = new GuildVcMemberSum(DatabaseClient._prisma.guildVcMemberSum);
	public readonly vcMemberUpperTwo = new GuildVcMemberUpperTwo(DatabaseClient._prisma.guildVcMemberUpperTwo);
	public readonly blackList = new BlackList(DatabaseClient._prisma.guildBlackList);
	public readonly bumpCounter = new BumpCounter(DatabaseClient._prisma.bumpCounter);
	public readonly settings = new DatabaseGuildSettingsTables();
}
