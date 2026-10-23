export type MemberLevelGain = {
  guildId: string;
  userId: string;
  point: number;
};

export type LevelScore = {
  level: bigint;
  point: bigint;
};

export type GuildMemberLevelRow = LevelScore & { guildId: string; userId: string };

export type UserLevelRow = LevelScore & { userId: string };

export type MemberLevelStanding = LevelScore & { rank: number };
