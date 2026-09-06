import { MapWithGC } from "./MapWithGC";

export type UserDictionaryEntry = {
  userId: string;
  word: string;
  reading: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDictionaryValue = {
  entries: UserDictionaryEntry[];
  createdAt: Date;
};

const twelveHours = 12 * 60 * 60 * 1000;

export class UserDictionary extends MapWithGC<string, UserDictionaryValue> {
  public override gc(): void {
    for (const [userId, value] of this.entries()) {
      if (Date.now() - twelveHours > value.createdAt.getTime()) {
        this.delete(userId);
      }
    }
  }
}
