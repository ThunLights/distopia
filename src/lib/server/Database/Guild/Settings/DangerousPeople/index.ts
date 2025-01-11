import { Ban } from "./DangerousPeople.ban";
import { Notice } from "./DangerousPeople.notice";

import type { PrismaClient } from "@prisma/client";

export class DangerousPeople {
	public readonly ban: Ban;
	public readonly notice: Notice;

	constructor(prisma: PrismaClient) {
		this.ban = new Ban(prisma.dangerousPeopleBanBasis);
		this.notice = new Notice(prisma.dangerousPeopleNoticeChannel);
	}
}
