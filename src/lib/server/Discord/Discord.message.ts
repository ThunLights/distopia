import { database } from "../Database/index";

import type { Client, Message, OmitPartialGroupDMChannel } from "discord.js";

export class MessageClient {
    constructor(private readonly client: Client) {}

    public async create(message: OmitPartialGroupDMChannel<Message<boolean>>): Promise<void> {
		if (!(message.guild && message.guildId)) {
			return;
		}
		const guild = await database.guildTables.guild.id2Data(message.guildId);
		if (guild && message.content.length) {
			await database.guildTables.level.plus(message.guildId, BigInt(message.content.length));
		}
    }
}
