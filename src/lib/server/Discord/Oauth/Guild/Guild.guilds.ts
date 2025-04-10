import type { UserElement } from "$lib/server/Database/Database.user";
import type { GuildsUser } from "$lib/server/discord";
import { errorHandling } from "$lib/server/error";

export class Guilds {
	public async exec(user: UserElement) {
		try {
			const response = await fetch(
				"https://discord.com/api/v10/users/@me/guilds?with_counts=true",
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${user.accessToken}`
					}
				}
			);
			if (response.ok) {
				return (await response.json()) as Array<GuildsUser>;
			}
			return null;
		} catch (error) {
			errorHandling(error);
			return null;
		}
	}
}
