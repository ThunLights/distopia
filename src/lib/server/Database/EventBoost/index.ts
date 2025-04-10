import { errorHandling } from "$lib/server/error";
import { DatabaseClient } from "../index";
import { LateLimit } from "./EventBoost.latelimit";

export class EventBoost {
	public readonly latelimit = new LateLimit(DatabaseClient._prisma.eventBoostLateLimit);

	private readonly table = DatabaseClient._prisma.eventBoost;

	public async fetch(guildId: string) {
		try {
			return await this.table.findFirst({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async findMany() {
		try {
			return await this.table.findMany();
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

	public async update(guildId: string, eventId: string) {
		try {
			const element = await this.table.findFirst({ where: { guildId } });
			if (element) {
				await this.table.updateMany({
					where: { guildId },
					data: { eventId }
				});
			} else {
				await this.table.create({ data: { guildId, eventId } });
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async remove(guildId: string) {
		try {
			return await this.table.deleteMany({ where: { guildId } });
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}
