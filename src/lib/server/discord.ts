import { errorHandling } from "./error.js";
import { sleep } from "../sleep.js";
import { DiscordBotClient } from "./Discord/index.js";
import { database } from "./Database/index.js";

import cfg from "../../../important/discord.json" assert { type: "json" };

type DiscordConfig = {
    bot: {
        id: string
        token: string
        secret: string
        url: string
    }
    oauth: string
};

type AccessToken2dataResponse = {
    id: string
    username: string
    avatar: string
    global_name: string
    email: string | null
};

type CodeCheckResponse = {
    token_type: string
    access_token: string
    expires_in: number
    refresh_token: string
    scope: string
};

export type Code2dataResponse = CodeCheckResponse & AccessToken2dataResponse;

export class DiscordController {
    public readonly config: DiscordConfig = cfg;
    public readonly bot = new DiscordBotClient();

    constructor() {
    }

    private async getMoreInfo(accessToken: string) {
        try {
            const response = await fetch("https://discord.com/api/users/@me", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            if (response.ok) {
                const json = await response.json();
                return {
                    id: json.id as string,
                    username: json.username as string,
                    email: json.email as string | null | undefined,
                    avatar: json.avatar as string | null | undefined,
                };
            }

            return null;
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }

    public async codeChecker(code: string) {
        try {
            const params = new URLSearchParams();
            params.append("client_id", this.config.bot.id);
            params.append("client_secret", this.config.bot.secret);
            params.append("grant_type", "authorization_code");
            params.append("redirect_uri", encodeURI(this.config.bot.url));
            params.append("code", code);
            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params.toString(),
            });
            if (response.ok) {
                const json = await response.json()
                if (typeof json.access_token === "string" && typeof json.refresh_token === "string") {
                    const userInfo = await this.getMoreInfo(json.access_token);
                    if (userInfo) {
                        const token = await database.token.add(userInfo.id);
                        await database.user.update(userInfo.id, userInfo.username, json.access_token, json.refresh_token);
                        if (userInfo.email) {
                            await database.email.update(userInfo.id, userInfo.email);
                        }
                        if (userInfo.avatar) {
                            await database.avatar.update(userInfo.id, userInfo.avatar);
                        }
                        return {
                            id: userInfo.id,
                            username: userInfo.username,
                            config: this.config,
                            userInfo,
                            token,
                        };
                    }
                }
            }
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }

    public async guilds(accessToken: string) {
        try {
            const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
//                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            if (response.ok) {
                console.log(await response.json())
            }
        } catch (error) {
            errorHandling(error)
        }
    }

    public async resetAccessToken(refreshToken: string) {
        try {
            const params = new URLSearchParams();
            params.append("client_id", this.config.bot.id);
            params.append("client_secret", this.config.bot.secret);
            params.append("grant_type", "refresh_token");
            params.append("refresh_token", refreshToken);
            const response = await fetch("", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params.toString(),
            })
            if (response.ok) {
                console.log(await response.json())
            }
        } catch (error) {
            errorHandling(error);
        }
    }

    public static async sendVerifyMessage<T extends object>(url: string, contents: T): Promise<boolean> {
        try {
            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(contents),
                headers: {
				    "Content-Type": "application/json"
                },
            });

            if (response.status === 429) {
                await sleep(1000);
                return await this.sendVerifyMessage(url, contents);
            }

            return response.ok;
        } catch (error) {
            errorHandling(error);
            return false;
        }
    }
}

export const discord = new DiscordController();
