export type UserLevelRanking = {
  readonly id: string;
  name: string;
  displayName: string;
  avatarUrl?: string;
  level: bigint;
  point: bigint;
};
