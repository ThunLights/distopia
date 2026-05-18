import { MapWithGC } from "./MapWithGC";

export type Value = {
  messageLens: number[];
  updatedAt: Date;
};

export class MessageCreate extends MapWithGC<string, Value> {
  public override gc(): void {
    for (const [key, value] of this.entries()) {
      if (Date.now() - 15 * 60 * 1000 > value.updatedAt.getTime()) {
        this.delete(key);
      }
    }
  }
}
