import { DatabaseClient } from "../index";
import { LateLimit } from "./EventBoost.latelimit";

export class EventBoost {
	public readonly latelimit = new LateLimit(DatabaseClient._prisma.eventBoostLateLimit);
}
