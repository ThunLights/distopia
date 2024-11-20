import { errorHandling } from "../error";
import { Client } from "discord.js";

export class GuildClientError {
    constructor(public readonly content: string) {
    }
}

export class GuildClient {
    constructor(private readonly client: Client) {
    }

    public get guilds() {
        return this.client.guilds.cache;
    }

    public async fetchGuild(guildId: string): Promise<boolean> {
        try {
            return this.client.guilds.cache.map(value => value.id).includes(guildId);
        } catch (error) {
            errorHandling(error);
            return false;
        }
    }
}
