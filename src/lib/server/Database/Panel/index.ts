import { DatabaseClient } from "../index";
import { DangerousPeopleScore } from "./Panel.dangerousPeopleScore";

export class Panel {
	public readonly dangerousPeopleScore = new DangerousPeopleScore(
		DatabaseClient._prisma.dangerousPeopleScorePanel
	);
}
