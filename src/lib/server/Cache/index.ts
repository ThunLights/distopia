import { DiscordCache } from "./Discord/index";

export class CacheClient {
	public readonly discord = new DiscordCache();
}

export const cache = new CacheClient();
