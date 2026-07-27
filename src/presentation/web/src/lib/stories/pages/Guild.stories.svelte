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

  // Half a year of daily data points, matching the +page.server.ts's
  // six-month window, so the Storybook preview shows a realistic amount
  // of history instead of a handful of points.
  function generateMockRecordOneDays(days: number): RecordOneDay[] {
    const oneDayMs = 24 * 60 * 60 * 1000;
    const today = new Date("2026-07-25").getTime();
    const records: RecordOneDay[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today - i * oneDayMs);
      const progress = (days - i) / days;

      records.push({
        date,
        memberCount: Math.round(100 + progress * 60 + Math.sin(i / 5) * 8),
        activeRate: Math.round(60 + Math.sin(i / 7) * 20 + progress * 10),
        level: Math.min(30, Math.floor(progress * 30)),
      });
    }

    return records;
  }

  const mockRecordOneDays: RecordOneDay[] = generateMockRecordOneDays(182);

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
