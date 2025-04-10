import { CacheGuilds } from "./Discord.guilds";
import { CacheGuildsJoin } from "./Discord.guildsJoin";
import { CacheUsers } from "./Discord.users";

export class DiscordCache {
	public readonly guilds = new CacheGuilds();
	public readonly guildsJoin = new CacheGuildsJoin();
	public readonly users = new CacheUsers();
}
