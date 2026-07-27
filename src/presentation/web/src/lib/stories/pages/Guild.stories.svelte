<script lang="ts" module>
  import { mockUser } from "../../../mocks/data";
  import Page from "../../../routes/guilds/[id]/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  type GuildData = {
    guildId: string;
    name: string;
    nsfw: boolean;
    description: string | null;
    boostCount: number;
    tags: string[];
    iconUrl: string | undefined;
    activeRate: number;
    activeRateRank: number | undefined;
    level: bigint | undefined;
    point: bigint | undefined;
    levelRank: number | undefined;
    maxActiveRateRank: bigint | undefined;
    maxActiveRate: bigint | undefined;
    maxLevelRank: bigint | undefined;
    invite: string;
  };

  type Review = {
    userId: string;
    username: string | null;
    avatarUrl: string | null;
    star: number;
    content: string | null;
  };

  type RecordOneDay = {
    date: Date;
    memberCount: number;
    activeRate: number;
    level: number;
  };

  const mockGuild: GuildData = {
    guildId: "111111111111111111",
    name: "テストサーバー Alpha",
    nsfw: false,
    description: "テスト用のDiscordサーバーです。ゲームやコミュニティ活動を行っています。",
    boostCount: 5,
    tags: ["ゲーム", "コミュニティ", "雑談"],
    iconUrl: undefined,
    activeRate: 85,
    activeRateRank: 2,
    level: 25 as unknown as bigint,
    point: 1234 as unknown as bigint,
    levelRank: 3,
    maxActiveRateRank: 1 as unknown as bigint,
    maxActiveRate: 92 as unknown as bigint,
    maxLevelRank: 2 as unknown as bigint,
    invite: "https://discord.gg/example1",
  };

  const mockReviews: Review[] = [
    {
      userId: "555555555555555555",
      username: "レビュアーA",
      avatarUrl: null,
      star: 5,
      content: "とても良いサーバーです！運営が丁寧で雰囲気も良いです。",
    },
    {
      userId: "666666666666666666",
      username: "レビュアーB",
      avatarUrl: null,
      star: 4,
      content: "楽しいサーバーでした。もう少しイベントが増えると嬉しいです。",
    },
    {
      userId: "777777777777777777",
      username: "レビュアーC",
      avatarUrl: null,
      star: 3,
      content: null,
    },
  ];

  const mockRecordOneDays: RecordOneDay[] = [
    { date: new Date("2026-07-20"), memberCount: 120, activeRate: 70, level: 20 },
    { date: new Date("2026-07-21"), memberCount: 125, activeRate: 75, level: 21 },
    { date: new Date("2026-07-22"), memberCount: 130, activeRate: 78, level: 22 },
    { date: new Date("2026-07-23"), memberCount: 128, activeRate: 80, level: 23 },
    { date: new Date("2026-07-24"), memberCount: 135, activeRate: 82, level: 24 },
    { date: new Date("2026-07-25"), memberCount: 140, activeRate: 85, level: 25 },
  ];

  const { Story } = defineMeta({
    title: "Pages/Guild",
    component: Page,
  });
</script>

<Story
  name="ゲスト表示"
  args={{
    data: {
      user: null,
      guildId: "111111111111111111",
      guild: mockGuild,
      reviews: mockReviews,
      recordOneDays: mockRecordOneDays,
    },
  }}
/>

<Story
  name="ログイン済み表示"
  args={{
    data: {
      user: mockUser,
      guildId: "111111111111111111",
      guild: mockGuild,
      reviews: mockReviews,
      recordOneDays: mockRecordOneDays,
    },
  }}
/>

<Story
  name="レビューなし"
  args={{
    data: {
      user: null,
      guildId: "111111111111111111",
      guild: { ...mockGuild, description: null },
      reviews: [],
      recordOneDays: mockRecordOneDays,
    },
  }}
/>
