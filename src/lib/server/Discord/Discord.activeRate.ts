import { errorHandling } from "$lib/server/error";
import { sumArrayContents } from "../../array";
import { database } from "../Database/index";
import { discord } from "../discord";
import { activeRate } from "../rate";

import type { Client } from "discord.js";

export class ActiveRateClient {
	constructor(private readonly client: Client) {}

	private async updateGuild(guildId: string) {
		try {
			const newMember = sumArrayContents(
				(await database.guildTables.newMember.thirtyDays(guildId)).map((value) => value.count)
			);
			const newMessage = sumArrayContents(
				(await database.guildTables.newMessage.thirtyDays(guildId)).map((value) => value.count)
			);
			const vcMemberSum = (await database.guildTables.vcMemberSum.thirtyDays(guildId)).length;
			const vcMemberUpperTwo = sumArrayContents(
				(await database.guildTables.vcMemberUpperTwo.thirtyDays(guildId)).map(
					(value) => value.count
				)
			);
			const activeMember = await discord.bot.control.guild.memberCount(guildId, "online");
			const allMember = await discord.bot.control.guild.memberCount(guildId);
			if (activeMember && allMember) {
				const rate = BigInt(
					await activeRate.calc({
						newMember,
						newMessage,
						vcMemberSum,
						vcMemberUpperTwo,
						activeMember,
						allMember
					})
				);
				await database.archives.activeRate.max.update(guildId, rate);
				return await database.guildTables.activeRate.update(guildId, rate);
			}
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
