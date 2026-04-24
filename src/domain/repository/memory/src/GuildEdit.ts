import type { GuildVisibility } from "infra-database/prelude/prisma";

export type Value = {
  description?: string;
  nsfw?: boolean;
  visibility: GuildVisibility;
  tags?: string[];
};

export class GuildEdit extends Map<string, Value> {}
