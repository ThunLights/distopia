
export abstract class CacheClientBase<T> {
    public abstract caches: Record<string, T>;
    public abstract readonly deleteRate: number;

    public abstract insert(userId: string, data: T): Promise<void>

    public async checkCache(id: string) {
        if (Object.keys(this.caches).includes(id)) {
            return this.caches[id]
        }
        return null;
    }
}
