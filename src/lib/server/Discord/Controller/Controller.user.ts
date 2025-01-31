import { cache } from "$lib/server/Cache/index";
import { errorHandling } from "$lib/server/error";

import type { Client } from "discord.js";

export class User {
	constructor(private readonly client: Client) {}

	public static async fetch(client: Client, userId: string) {
		try {
			const user = client.users.cache.get(userId) ?? null;
			if (user) {
				await cache.discord.users.insert(user.id, {
					userId: user.id,
					avatarUrl: user.avatarURL(),
					username: user.username,
					displayName: user.displayName,
				});
			}
			return user;
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}

	public async fetch(userId: string) {
		try {
			return await User.fetch(this.client, userId);
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}
