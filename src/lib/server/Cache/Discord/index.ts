import { CacheGuilds } from "./Discord.guilds";
import { CacheGuildsJoin } from "./Discord.guildsJoin";

export class DiscordCache {
    public readonly guilds = new CacheGuilds();
	public readonly guildsJoin = new CacheGuildsJoin();
}
