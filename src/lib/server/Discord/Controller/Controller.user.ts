import { errorHandling } from "$lib/server/error";

import type { Client } from "discord.js";

export class User {
	constructor(private readonly client: Client) {}

	public static async fetch(client: Client, userId: string) {
		try {
			return client.users.cache.get(userId) ?? null;
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
