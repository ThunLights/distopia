<script module>
  import { mockUser } from "../../../mocks/data";
  import Page from "../../../routes/user/guilds/[id]/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const mockMeta = {
    id: "111111111111111111",
    name: "テストサーバー Alpha",
    avatarUrl: undefined,
  };

  const mockGuild = {
    name: "テストサーバー Alpha",
    public: true,
    description: "テスト用のDiscordサーバーです。",
    invite: "https://discord.gg/example1",
    tags: ["ゲーム", "コミュニティ"],
    nsfw: false,
  };

  const mockRecord = {
    bumpCounter: 42,
    activeRate: 85,
    maxRate: 92,
    maxRateRank: 1,
    maxLevelRank: 2,
    levelRank: 3,
    rateRank: 2,
    level: 25,
    point: 1234,
  };

  const { Story } = defineMeta({
    title: "Pages/User/Guild",
    component: Page,
  });
</script>

<Story
  name="公開サーバー管理"
  args={{
    data: {
      user: mockUser,
      guildId: "111111111111111111",
      guild: mockGuild,
      meta: mockMeta,
      record: mockRecord,
    },
  }}
/>

<Story
  name="未登録サーバー"
  args={{
    data: {
      user: mockUser,
      guildId: "999999999999999999",
      guild: null,
      meta: { id: "999999999999999999", name: "未登録サーバー", avatarUrl: undefined },
      record: null,
    },
  }}
/>
