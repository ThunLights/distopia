import { Base } from "./Base";
import { FriendTable } from "./FriendTable";
import { GuildRecordOneDayTable } from "./GuildRecordOneDayTable";
import { GuildRecordTable } from "./GuildRecordTable";
import { GuildReviewTable } from "./GuildReviewTable";
import { GuildSettingTable } from "./GuildSettingTable";
import { GuildTable } from "./GuildTable";
import { JWTKeyTable } from "./JWTKeyTable";
import { PanelTable } from "./PanelTable";
import { UserTable } from "./UserTable";
import { UserWebTable } from "./UserWebTable";

export class DatabaseClient extends Base {
  public readonly friend = new FriendTable(this.prisma);
  public readonly guild = new GuildTable(this.prisma);
  public readonly guildRecord = new GuildRecordTable(this.prisma);
  public readonly guildRecordOneDay = new GuildRecordOneDayTable(this.prisma);
  public readonly guildReview = new GuildReviewTable(this.prisma);
  public readonly guildSetting = new GuildSettingTable(this.prisma);
  public readonly jwtKey = new JWTKeyTable(this.prisma);
  public readonly panel = new PanelTable(this.prisma);
  public readonly user = new UserTable(this.prisma);
  public readonly userWeb = new UserWebTable(this.prisma);
}
