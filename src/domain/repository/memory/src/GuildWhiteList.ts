import { MapWithGC } from "./MapWithGC";

export type Entry = {
  guildId: string;
  targetId: string;
  idType: "ChannelId" | "RoleId" | "UserId";
  allPermissions: boolean;
  permissions: "InviteLinkBlock"[];
  createdAt: Date;
  updatedAt: Date;
};

export type GuildWhiteListValue = {
  entries: Entry[];
  createdAt: Date;
};

const twelveHours = 12 * 60 * 60 * 1000;

export class GuildWhiteList extends MapWithGC<string, GuildWhiteListValue> {
  public override gc(): void {
    for (const [guildId, value] of this.entries()) {
      if (Date.now() - twelveHours > value.createdAt.getTime()) {
        this.delete(guildId);
      }
    }
  }
}
