import { PUBLIC_HOME_SERVER_ID, PUBLIC_HONORARY_MEMBER_ROLE_ID, PUBLIC_STAFF_ROLE_ID } from "$env/static/public";
import { database } from "$lib/server/Database/index";
import { errorHandling } from "$lib/server/error";
import { PermissionsBitField } from "discord.js";

import type { Client, PresenceStatus } from "discord.js";

export class Guild {
	constructor(private readonly client: Client) {}

	public static async isStaff(userId: string, client: Client) {
		try {
			const guild = client.guilds.cache.get(PUBLIC_HOME_SERVER_ID);
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

	public static async fetchEvents(guildId: string, client: Client) {
		try {
			const guild = client.guilds.cache.get(guildId);

			if (guild) {
				return guild.scheduledEvents.cache.values().toArray();
			}

			return [];
		} catch (error) {
			errorHandling(error);
			return [];
		}
	}

	public static async fetchEvent(guildId: string, eventId: string, client: Client) {
		try {
			const guild = client.guilds.cache.get(guildId);

			if (guild) {
				return guild.scheduledEvents.cache.get(eventId);
			}

			return null;
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

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
		const actingOwner = await database.guildTables.settings.owner.fetch(guildId);
		if (actingOwner) {
			return actingOwner.userId;
		}
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
		return await Guild.isStaff(userId, this.client);
	}

	public async isHonoraryMember(userId: string) {
		try {
			const guild = this.client.guilds.cache.get(PUBLIC_HOME_SERVER_ID);
			if (guild) {
				const users = guild.members.cache.values().filter(member => member.roles.cache.has(PUBLIC_HONORARY_MEMBER_ROLE_ID));
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

	public async fetchEvents(guildId: string) {
		return await Guild.fetchEvents(guildId, this.client);
	}

	public async fetchEvent(guildId: string, eventId: string) {
		return await Guild.fetchEvent(guildId, eventId, this.client);
	}
}
