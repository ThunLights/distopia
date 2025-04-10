import { GuildJoin } from "./Guild.join";
import { Guilds } from "./Guild.guilds";

export class OauthGuild {
	public readonly join = new GuildJoin();
	public readonly guilds = new Guilds();
}
