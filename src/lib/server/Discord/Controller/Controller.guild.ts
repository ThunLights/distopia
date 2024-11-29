import { errorHandling } from "$lib/server/error";

import type { Client, PresenceStatus } from "discord.js";

export class Guild {
	constructor(private readonly client: Client) {}

	public async memberCount(guildId: string, status?: PresenceStatus) {
		const guild = this.client.guilds.cache.get(guildId);
		if (!guild) {
			return null;
		}
		if (status) {
			return guild.members.cache.filter(value => (value.presence && value.presence.status === status)).size;
		}
		return guild.memberCount;
	}

	public async boost(guildId: string) {
		const guild = this.client.guilds.cache.get(guildId);
		if (!guild) {
			return null;
		}
		return guild.premiumSubscriptionCount;
	}

	public async events(guildId: string) {
		const guild = this.client.guilds.cache.get(guildId);
		if (!guild) {
			return null;
		}
		return Array.from(guild.scheduledEvents.cache.values());
	}

	public async owner(guildId: string) {
		const guild = this.client.guilds.cache.get(guildId);
		if (!guild) {
			return null;
		}
		return guild.ownerId;
	}

	public async isJoined(guildId: string): Promise<boolean> {
        try {
            return this.client.guilds.cache.map(value => value.id).includes(guildId);
        } catch (error) {
            errorHandling(error);
            return false;
        }
	}
}
