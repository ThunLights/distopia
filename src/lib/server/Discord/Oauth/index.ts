import { OauthGuild } from "./Guild/index";
import { OauthCode } from "./Oauth.code";
import { OauthFetch } from "./Oauth.fetch";

export class DiscordOauth {
    public readonly fetch = new OauthFetch();
    public readonly code = new OauthCode(this.fetch);
    public readonly guild = new OauthGuild(this.fetch);
}
