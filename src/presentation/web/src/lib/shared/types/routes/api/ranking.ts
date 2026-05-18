export type GuildRanking = {
  guildId: string;
  name: string;
  activeRate: number | null;
  level: number;
  point: number;
  memberCount: number | null;
  onlineMemberCount: number | null;
  iconUrl: string | null;
};

export type UserRanking = {
  id: string;
  displayName: string;
  username: string;
  bumpCounter: number | null;
  avatarUrl?: string;
};

export type ResponseMethodGet = {
  guild: {
    level: GuildRanking[];
    activeRate: GuildRanking[];
  };
  user: {
    bump: UserRanking[];
  };
};
