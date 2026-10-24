export type LevelCard = {
  level: bigint;
  point: bigint;
  nextPoint: bigint;
  rank: number | null;
};

export type RankCard = {
  name: string;
  avatarUrl: string;
  guildName: string;
  guild: LevelCard;
  global: LevelCard;
};

export interface RankCardRenderer {
  render(card: RankCard): Promise<Uint8Array>;
}
