import { MapWithGC } from "./MapWithGC";

export type TtsSynthesisCacheValue = {
  audio: Buffer;
  createdAt: Date;
};

const oneHour = 60 * 60 * 1000;

// Keyed by "<provider>:<speakerId>:<text>" (see Tts.synthesize) so the same phrase read by
// different speakers/providers never collides.
export class TtsSynthesisCache extends MapWithGC<string, TtsSynthesisCacheValue> {
  // gc() alone isn't enough to enforce the TTL -- Memory.gc() only runs every 20 minutes
  // (see app-schedule), so a plain Map.get() between runs could still return audio up to
  // ~1h20m stale. Override get() to treat an expired entry as a miss immediately.
  public override get(key: string): TtsSynthesisCacheValue | undefined {
    const value = super.get(key);
    if (value && Date.now() - oneHour > value.createdAt.getTime()) {
      this.delete(key);
      return undefined;
    }
    return value;
  }

  public override gc(): void {
    for (const [key, value] of this.entries()) {
      if (Date.now() - oneHour > value.createdAt.getTime()) {
        this.delete(key);
      }
    }
  }
}
