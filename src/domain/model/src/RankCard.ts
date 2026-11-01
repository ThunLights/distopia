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

export type LeaderboardRow = {
  name: string;
  avatarUrl: string;
  level: bigint;
  rank: number | null;
};

export type LeaderboardCard = {
  guildName: string;
  top: LeaderboardRow[];
  self: LeaderboardRow | null;
};

export interface RankCardRenderer {
  render(card: RankCard): Promise<Uint8Array>;
  renderLeaderboard(card: LeaderboardCard): Promise<Uint8Array>;
}
