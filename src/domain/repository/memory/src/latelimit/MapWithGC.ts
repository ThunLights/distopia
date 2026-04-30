import type { LimitDate } from "./LimitDate";

export class MapWithGC<K extends string = string, V extends LimitDate = LimitDate> extends Map<
  K,
  V
> {
  public gc() {
    const nowTime = Date.now();

    for (const [key, value] of this.entries()) {
      if (nowTime > value.getTime()) {
        this.delete(key);
      }
    }
  }
}
