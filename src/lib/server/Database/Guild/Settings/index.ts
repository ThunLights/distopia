import { DatabaseClient } from "../..";
import { DangerousPeople } from "./DangerousPeople/index";
import { Bump } from "./Settings.bump";
import { BumpNoticeContent } from "./Settings.bumpNoticeContent";
import { BumpNoticeRole } from "./Settings.bumpNoticeRole";
import { Owner } from "./Settings.owner";

export class DatabaseGuildSettingsTables {
	public readonly dangerousPeople = new DangerousPeople();
	public readonly bump = new Bump(DatabaseClient._prisma.bumpNotice);
	public readonly bumpNoticeRole = new BumpNoticeRole(DatabaseClient._prisma.bumpNoticeRole);
	public readonly bumpNoticeContent = new BumpNoticeContent(
		DatabaseClient._prisma.bumpNoticeContent
	);
	public readonly owner = new Owner(DatabaseClient._prisma.actingOwner);
}
