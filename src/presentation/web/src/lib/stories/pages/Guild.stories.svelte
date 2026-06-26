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
    },
  }}
/>
