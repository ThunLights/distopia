import { MapWithGC } from "./MapWithGC";

export type Value = {
  memberCounts: number[];
};

export class VoiceChannelMember extends MapWithGC<string, Value> {
  public override gc(): void {
    for (const [key, value] of this.entries()) {
      if (value.memberCounts.length > 40) {
        this.set(key, { ...value, memberCounts: value.memberCounts.slice(0, 40) });
      }
    }
  }

  public pushMemberCounts(guildId: string, num: number) {
    const data = this.get(guildId);
    const memberCounts = data?.memberCounts ? [...data.memberCounts, num] : [num];
    this.set(guildId, { memberCounts });
  }
}
