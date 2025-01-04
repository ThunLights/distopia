import { config } from "$lib/server/config";
import { database } from "$lib/server/Database";
import { errorHandling } from "$lib/server/error";

export class OauthCode {
    private readonly config = config;

    public async getMoreInfo(accessToken: string) {
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
}
