import { MapWithGC } from "./MapWithGC";

export type TtsSynthesisCacheValue = {
  audio: Buffer;
  createdAt: Date;
};

const oneHour = 60 * 60 * 1000;

// Keyed by "<provider>:<speakerId>:<text>" (see Tts.synthesize) so the same phrase read by
// different speakers/providers never collides.
export class TtsSynthesisCache extends MapWithGC<string, TtsSynthesisCacheValue> {
  public override gc(): void {
    for (const [key, value] of this.entries()) {
      if (Date.now() - oneHour > value.createdAt.getTime()) {
        this.delete(key);
      }
    }
  }
}
