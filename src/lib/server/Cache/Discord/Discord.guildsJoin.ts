import { CacheClientBase } from "../Cache.base";

export type CacheContent = {
	status: number
}

export class CacheGuildsJoin extends CacheClientBase<CacheContent> {
    public readonly caches: Record<string, CacheContent> = {};
    public readonly deleteRate = 1 * 60 * 1000;
}
