import type { Client } from "discord.js";

export class Guild {
	constructor(private readonly client: Client) {}

	public memberCount(guildId: string) {
		const guild = this.client.guilds.cache.get(guildId);
		if (!guild) {
			return null;
		}
		return guild.memberCount;
	}
}
