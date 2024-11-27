import { DiscordCache } from "./Discord";

export class CacheClient {
    public readonly discord = new DiscordCache();
}

export const cache = new CacheClient();
