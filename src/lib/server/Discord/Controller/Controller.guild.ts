import { PUBLIC_HOME_SERVER_ID, PUBLIC_STAFF_ROLE_ID } from "$env/static/public";
import { errorHandling } from "$lib/server/error";

import { PermissionsBitField, type Client, type PresenceStatus } from "discord.js";

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

	public async fetchOwner(guildId: string) {
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

	public async isStaff(userId: string) {
		try {
			const guild = this.client.guilds.cache.get(PUBLIC_HOME_SERVER_ID);
			if (guild) {
				const users = guild.members.cache.values().filter(member => member.roles.cache.has(PUBLIC_STAFF_ROLE_ID));
				return users.toArray().map(user => user.id).includes(userId);
			}

			return false;
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}

	public async adminUsers(guildId: string) {
		try {
			const guild = this.client.guilds.cache.get(guildId);
			if (guild) {
				const members = Array.from(guild.members.cache.values());
				return members.filter(member => !member.user.bot && member.permissions.has(PermissionsBitField.Flags.Administrator));
			}
			return [];
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

	public async isAdmin(guildId: string, userId: string) {
		try {
			const admins = await this.adminUsers(guildId);
			return admins.map(value => value.user.id).includes(userId)
		} catch (error) {
			errorHandling(error);
			return false;
		}
	}
}
