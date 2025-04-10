import { database, DatabaseError } from "../Database/index";

import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js";

export class MessageClient {
	private lateLimits: string[] = [];

	constructor(private readonly client: Client) {}

	private async calcScore(x: number) {
		return Math.ceil(Math.sqrt(x));
	}

	public async create(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
		if (message.author.bot) {
			return;
		}
		if (!(message.guild && message.guildId)) {
			return;
		}
		const guild = await database.guildTables.guild.id2Data(message.guildId);
		if (guild instanceof DatabaseError) {
			return;
		}
		if (guild && !this.lateLimits.includes(message.author.id)) {
			this.lateLimits.push(message.author.id);
			await database.guildTables.newMessage.update(guild.guildId);
			if (message.content.length) {
				await database.guildTables.level.plus(
					message.guildId,
					BigInt(await this.calcScore(message.content.length))
				);
			}
			setTimeout(() => {
				this.lateLimits = this.lateLimits.filter((value) => value !== message.author.id);
			}, 15 * 1000);
		}
	}
}
