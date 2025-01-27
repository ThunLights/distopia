import { DatabaseClient } from "$lib/server/Database/index";
import { Ban } from "./DangerousPeople.ban";
import { Notice } from "./DangerousPeople.notice";

export class DangerousPeople {
	public readonly ban = new Ban(DatabaseClient._prisma.dangerousPeopleBanBasis);
	public readonly notice = new Notice(DatabaseClient._prisma.dangerousPeopleNoticeChannel);
}
