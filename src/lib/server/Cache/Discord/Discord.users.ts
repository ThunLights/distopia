import { CacheClientBase } from "../Cache.base";

export type User = {
	userId: string
	avatarUrl: string | null
	username: string
	displayName: string
}

export class CacheUsers extends CacheClientBase<User> {
	public readonly caches: Record<string, User> = {};
	public readonly deleteRate = 20 * 60 * 1000;
}
