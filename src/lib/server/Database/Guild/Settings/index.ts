import { DatabaseClient } from "../..";
import { DangerousPeople } from "./DangerousPeople/index";
import { Bump } from "./Settings.bump";
import { BumpNoticeRole } from "./Settings.bumpNoticeRole";
import { Owner } from "./Settings.owner";

export class DatabaseGuildSettingsTables {
	public readonly dangerousPeople = new DangerousPeople();
	public readonly bump = new Bump(DatabaseClient._prisma.bumpNotice);
	public readonly bumpNoticeRole = new BumpNoticeRole(DatabaseClient._prisma.bumpNoticeRole);
	public readonly owner = new Owner(DatabaseClient._prisma.actingOwner);
}
