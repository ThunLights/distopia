export type Value = {
  description?: string;
  nsfw?: boolean;
  pub?: boolean;
  tags?: string[];
  invite?: string;
  updated: Date;
};

export class GuildEdit extends Map<string, Value> {}
