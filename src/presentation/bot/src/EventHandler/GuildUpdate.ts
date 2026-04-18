import type { Guild } from "infra-discord/prelude";

import { BaseHandler } from "./BaseHandler";

export class GuildUpdate extends BaseHandler<(oldGuild: Guild, newGuild: Guild) => void> {
  public override async handle(_oldGuild: Guild, _newGuild: Guild): Promise<void> {}
}
