import { PrismaClient } from "@prisma/client";

import { Token } from "./Database.token";
import { User } from "./Database.user";
import { Email } from "./Database.email";
import { Avatar } from "./Database.avatar";
import { DatabaseGuildTables } from "./Guild/index";
import { DatabaseArchiveTables } from "./Archive/index";
import { Friend } from "./Friend/index";
import { DatabaseRankingPanelTables } from "./RankingPanel/index";
import { DangerousPeople } from "./DangerousPeople/index";
import { Panel } from "./Panel/index";
import { Sales } from "./Database.sales";
import { UserBumpCounter } from "./Database.userBumpCounter";

export class DatabaseError {
    constructor(public readonly content: string) {}
}

export class DatabaseClient {
    public readonly prisma = new PrismaClient();
    public readonly token = new Token(this.prisma.token);
    public readonly user = new User(this.prisma.user);
    public readonly email = new Email(this.prisma.email);
    public readonly avatar = new Avatar(this.prisma.avatar);
    public readonly guildTables = new DatabaseGuildTables(this.prisma);
	public readonly friend = new Friend(this.prisma);
	public readonly archives = new DatabaseArchiveTables(this.prisma);
	public readonly rankingPanel = new DatabaseRankingPanelTables(this.prisma);
	public readonly dangerousPeople = new DangerousPeople(this.prisma);
	public readonly panel = new Panel(this.prisma);
	public readonly sales = new Sales(this.prisma.sales);
	public readonly userBump = new UserBumpCounter(this.prisma.userBumpCounter);
}

export const database = new DatabaseClient();
