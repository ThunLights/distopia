import { CacheClientBase } from "../Cache.base";

export type CacheContent = {
	status: number
}

export class CacheGuildsJoin extends CacheClientBase<CacheContent> {
    public caches: Record<string, CacheContent> = {};
    public deleteRate = 5 * 60 * 1000;
}
