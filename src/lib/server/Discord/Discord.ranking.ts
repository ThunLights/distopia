import { errorHandling } from "$lib/server/error";
import { database } from "$lib/server/Database/index";

import type { Client } from "discord.js";
import { parseRanking } from "../ranking";

export class RankingClient {
	constructor(private readonly client: Client) {}

	private async updateLevel() {
		try {
			const guilds = await database.guildTables.level.ranking();
			for (const guild of guilds) {
				const { guildId } = guild;
				const rank = parseRanking(guildId, guilds.map(value => {return {
					guildId: value.guildId,
					content: value.level,
				}}));
				if (rank) {
					await database.archives.level.ranking.update(guildId, BigInt(Math.ceil(rank)));
				}
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	private async updateActiveRate() {
		try {
			const guilds = await database.guildTables.activeRate.ranking();
			for (const guild of guilds) {
				const { guildId } = guild;
				const rank = parseRanking(guildId, guilds);
				if (rank) {
					await database.archives.activeRate.ranking.update(guildId, BigInt(Math.ceil(rank)));
				}
			}
			return true;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async udpate() {
		await this.updateLevel();
		await this.updateActiveRate();
	}
}
