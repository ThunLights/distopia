import { Base } from "./Base";
import { GuildRecordTable } from "./GuildRecordTable";
import { GuildSettingTable } from "./GuildSettingTable";
import { GuildTable } from "./GuildTable";
import { UserTable } from "./UserTable";

export class DatabaseClient extends Base {
  public readonly guild = new GuildTable(this.prisma);
  public readonly guildRecord = new GuildRecordTable(this.prisma);
  public readonly guildsetting = new GuildSettingTable(this.prisma);
  public readonly user = new UserTable(this.prisma);
}
