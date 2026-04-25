export type Value = {
  description?: string;
  nsfw?: boolean;
  public?: boolean;
  tags?: string[];
};

export class GuildEdit extends Map<string, Value> {}
