import type { Guild } from "infra-database/types";

import type { GuildMetaData } from "./GuildMetaData";

export type RootPage = {
  latestGuilds: {
    guild: Guild;
    meta: GuildMetaData;
  }[];
  activeGuilds: {
    guild: Guild;
    meta: GuildMetaData;
  }[];
};
