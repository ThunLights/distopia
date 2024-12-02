import { CacheClientBase } from "../Cache.base";

import type { GuildsUser } from "$lib/server/discord";

export class CacheGuilds extends CacheClientBase<GuildsUser[]> {
    public caches: Record<string, GuildsUser[]> = {};
    public readonly deleteRate = 5 * 60 * 1000;
}
