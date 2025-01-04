import { GuildJoin } from "./Guild.join";
import { Guilds } from "./Guild.guilds";

import type { OauthFetch } from "../Oauth.fetch";

export class OauthGuild {
    public readonly join  = new GuildJoin();
    public readonly guilds: Guilds;

    constructor (private readonly fetch: OauthFetch) {
        this.guilds = new Guilds(this.fetch);
    }
}
