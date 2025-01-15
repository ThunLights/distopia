import { DangerousPeopleScore } from "./Panel.dangerousPeopleScore";

import type { PrismaClient } from "@prisma/client";

export class Panel {
	public readonly dangerousPeopleScore:  DangerousPeopleScore;

	constructor(prisma: PrismaClient) {
		this.dangerousPeopleScore = new DangerousPeopleScore(prisma.dangerousPeopleScorePanel);
	}
}
