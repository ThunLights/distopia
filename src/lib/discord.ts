import { errorHandling } from "./error.js";
import { sleep } from "./sleep.js";

import fs from "fs";
import path from "path";

import cfg from "../../important/discord.json" assert { type: "json" };

const __dirname = import.meta.dirname;

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
    config: DiscordConfig

    constructor() {
        this.config = cfg;
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
    public async code2data(code: string): Promise<Code2dataResponse | null> {
        try {
            const data = await this.codeCheck(code);

            if (data) {
                const accoutInfo = await this.accessToken2data(data.access_token);
                if (accoutInfo) {
                    console.log(accoutInfo.avatar);
                    return {...data, ...accoutInfo};
                }
            }

            return null
        } catch (error) {
            errorHandling(error);
            return null
        }
    }
    private async accessToken2data(accessToken: string): Promise<AccessToken2dataResponse | null> {
        try {
            const response = await fetch(`https://discord.com/api/users/@me`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
            });

            if (response.ok) {
                const json = await response.json();
                return json;
            } else if (response.status === 429) {
                await sleep(1000);
                return await this.accessToken2data(accessToken);
            }

            return null;
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }
    private async codeCheck(code: string): Promise<CodeCheckResponse | null> {
        try {
            const formDatas = {
                client_id: this.config.bot.id,
                client_secret: this.config.bot.secret,
                grant_type: "authorization_code",
                redirect_uri: this.config.bot.url,
                code,
            };
            const form = new FormData();
            for (const [key, value] of Object.entries(formDatas)) form.append(key, value);

            const response = await fetch("https://discord.com/api/v10/oauth2/token", {
                method: "POST",
                body: form,
            })

            if (response.ok) {
                return await response.json();
            }

            return null
        } catch (error) {
            errorHandling(error);
            return null;
        }
    }
}
