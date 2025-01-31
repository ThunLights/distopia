import { errorHandling } from "$lib/server/error";

import type { Client } from "discord.js";

export class User {
	constructor(private readonly client: Client) {}

	public async fetchUser(userId: string) {
		try {
			return this.client.users.cache.get(userId) ?? null;
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}
