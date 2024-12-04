import { errorHandling } from "$lib/server/error";
import { database } from "../Database/index";
import { discord } from "../discord";

import type { Client } from "discord.js";

export class ActiveRateClient {
	constructor(private readonly client: Client) {}

	private async updateGuild(guildId: string) {
		try {
			const newMember = await database.guildTables.newMember.thirtyDays(guildId);
			const newMessage = await database.guildTables.newMessage.thirtyDays(guildId);
			const activeMember = await discord.bot.control.guild.memberCount(guildId, "online");
			const allMember = await discord.bot.control.guild.memberCount(guildId);
			if (activeMember && allMember) {}
//			const rate = BigInt(await activeRate.calc({
//				newMember,
//				newMessage,
//			}));
//			return await database.guildTables.activeRate.update(guildId, rate);
			return false;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async update() {
		const guilds = await database.guildTables.guild.datas();
		for (const guild of guilds) {
			await this.updateGuild(guild.guildId);
		}
	}
}
