import type { UserAuth } from "$lib/shared/types/UserAuth";
import type { Guild as SearchGuild } from "$lib/shared/types/routes/api/guild/search";
import type { GuildRanking, UserRanking } from "$lib/shared/types/routes/api/ranking";

export const mockUser: UserAuth = {
  id: "123456789012345678",
  username: "テストユーザー",
  avatarUrl: undefined,
};

export const mockGuildCards: SearchGuild[] = [
  {
    guildId: "111111111111111111",
    name: "テストサーバー Alpha",
    invite: "https://discord.gg/example1",
    description: "テスト用のDiscordサーバーです。ゲームやコミュニティ活動を行っています。",
    tags: ["ゲーム", "コミュニティ", "雑談"],
    nsfw: false,
    boostCount: 5,
    iconUrl: null,
    rank: 1,
  },
  {
    guildId: "222222222222222222",
    name: "テストサーバー Beta",
    invite: "https://discord.gg/example2",
    description: "プログラミングや技術的な話題が中心のサーバーです。",
    tags: ["プログラミング", "技術", "開発"],
    nsfw: false,
    boostCount: 2,
    iconUrl: null,
    rank: 3,
  },
  {
    guildId: "333333333333333333",
    name: "テストサーバー Gamma",
    invite: "https://discord.gg/example3",
    description: "アニメ・マンガ好きのためのサーバーです。",
    tags: ["アニメ", "マンガ", "オタク"],
    nsfw: false,
    boostCount: 8,
    iconUrl: null,
    rank: 2,
  },
  {
    guildId: "444444444444444444",
    name: "テストサーバー Delta",
    invite: "https://discord.gg/example4",
    description: "音楽制作や鑑賞が好きな人向けのコミュニティです。",
    tags: ["音楽", "DTM", "楽器"],
    nsfw: false,
    boostCount: 1,
    iconUrl: null,
    rank: null,
  },
];

export const mockGuildRankings: GuildRanking[] = [
  {
    guildId: "111111111111111111",
    name: "テストサーバー Alpha",
    activeRate: 92,
    level: 30,
    point: 2345,
    memberCount: 800,
    onlineMemberCount: 250,
    iconUrl: null,
  },
  {
    guildId: "222222222222222222",
    name: "テストサーバー Beta",
    activeRate: 78,
    level: 20,
    point: 1234,
    memberCount: 400,
    onlineMemberCount: 110,
    iconUrl: null,
  },
  {
    guildId: "333333333333333333",
    name: "テストサーバー Gamma",
    activeRate: 65,
    level: 15,
    point: 876,
    memberCount: 300,
    onlineMemberCount: 75,
    iconUrl: null,
  },
  {
    guildId: "444444444444444444",
    name: "テストサーバー Delta",
    activeRate: 55,
    level: 10,
    point: 450,
    memberCount: 150,
    onlineMemberCount: 30,
    iconUrl: null,
  },
];

export const mockUserRankings: UserRanking[] = [
  {
    id: "555555555555555555",
    displayName: "トップユーザー",
    username: "topuser",
    bumpCounter: 150,
    avatarUrl: undefined,
  },
  {
    id: "666666666666666666",
    displayName: "アクティブさん",
    username: "activeuser",
    bumpCounter: 98,
    avatarUrl: undefined,
  },
  {
    id: "777777777777777777",
    displayName: "常連ユーザー",
    username: "regularuser",
    bumpCounter: 45,
    avatarUrl: undefined,
  },
];

export const mockUserGuilds = [
  {
    id: "111111111111111111",
    name: "テストサーバー Alpha",
    icon: null,
    banner: null,
    owner: true,
    approximate_member_count: 800,
    approximate_presence_count: 250,
    isBotJoined: true,
    isPublic: true,
  },
  {
    id: "222222222222222222",
    name: "テストサーバー Beta",
    icon: null,
    banner: null,
    owner: false,
    approximate_member_count: 400,
    approximate_presence_count: 110,
    isBotJoined: true,
    isPublic: false,
  },
  {
    id: "888888888888888888",
    name: "プライベートサーバー",
    icon: null,
    banner: null,
    owner: true,
    approximate_member_count: 10,
    approximate_presence_count: 3,
    isBotJoined: false,
    isPublic: false,
  },
];
