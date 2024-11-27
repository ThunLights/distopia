import { CacheClientBase } from "../Cache.base";

import type { GuildsUser } from "$lib/server/discord";

export class CacheGuilds extends CacheClientBase<GuildsUser[]> {
    public caches: Record<string, GuildsUser[]> = {};
    public deleteRate = 5 * 60 * 1000;

    public insert(userId: string, data: GuildsUser[]): void {
        this.caches[userId] = data;
        setTimeout(() => {
            delete this.caches[userId]
        }, this.deleteRate);
    }
}
