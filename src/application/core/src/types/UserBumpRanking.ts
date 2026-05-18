export type UserBumpRanking = {
  readonly id: string;
  name: string;
  displayName: string;
  globalName?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bumpCounter: number | null;
};
