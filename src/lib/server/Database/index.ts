import { PrismaClient } from "@prisma/client";

import { Token } from "./Database.token";
import { User } from "./Database.user";
import { DatabaseGuildTables } from "./Guild/index";
import { DatabaseArchiveTables } from "./Archive/index";
import { Friend } from "./Friend/index";
import { DatabaseRankingPanelTables } from "./RankingPanel/index";
import { DangerousPeople } from "./DangerousPeople/index";
import { Panel } from "./Panel/index";
import { DatabaseBlackList } from "./Database.blacklist";
import { Ticket } from "./Ticket/index";

export class DatabaseError {
	constructor(public readonly content: string) {}
}

export class DatabaseClient {
	public static readonly _prisma = new PrismaClient();

	public readonly prisma = DatabaseClient._prisma;
	public readonly token = new Token(this.prisma.userToken);
	public readonly user = new User(this.prisma.user);
	public readonly blacklist = new DatabaseBlackList(this.prisma.blackList);

	public readonly guildTables = new DatabaseGuildTables();
	public readonly friend = new Friend();
	public readonly archives = new DatabaseArchiveTables();
	public readonly rankingPanel = new DatabaseRankingPanelTables();
	public readonly dangerousPeople = new DangerousPeople();
	public readonly panel = new Panel();
	public readonly ticket = new Ticket();
}

export const database = new DatabaseClient();
