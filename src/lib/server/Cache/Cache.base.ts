
export abstract class CacheClientBase<T> {
    public abstract readonly caches: Record<string, T>;
    public abstract readonly deleteRate: number;

    public async insert(userId: string, data: T): Promise<void> {
        this.caches[userId] = data;
        setTimeout(() => {
            delete this.caches[userId]
        }, this.deleteRate);
	}

    public async checkCache(id: string) {
        if (Object.keys(this.caches).includes(id)) {
            return this.caches[id]
        }
        return null;
    }
}
