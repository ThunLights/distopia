<script lang="ts" module>
  import { mockUser } from "../../../mocks/data";
  import Page from "../../../routes/user/guilds/[id]/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  type GuildMeta = {
    id: string;
    name: string;
    avatarUrl: string | undefined;
  };

  type GuildInfo = {
    name: string;
    public: boolean;
    description: string | null;
    invite: string;
    tags: string[];
    nsfw: boolean;
  };

  type GuildRecord = {
    bumpCounter: number;
    activeRate: bigint | null;
    maxRate: bigint | null;
    maxRateRank: bigint | null;
    maxLevelRank: bigint | null;
    levelRank: number | undefined;
    rateRank: number | undefined;
    level: bigint;
    point: bigint;
  };

  const mockMeta: GuildMeta = {
    id: "111111111111111111",
    name: "テストサーバー Alpha",
    avatarUrl: undefined,
  };

  const mockGuild: GuildInfo = {
    name: "テストサーバー Alpha",
    public: true,
    description: "テスト用のDiscordサーバーです。",
    invite: "https://discord.gg/example1",
    tags: ["ゲーム", "コミュニティ"],
    nsfw: false,
  };

  const mockRecord: GuildRecord = {
    bumpCounter: 42,
    activeRate: 85n,
    maxRate: 92n,
    maxRateRank: 1n,
    maxLevelRank: 2n,
    levelRank: 3,
    rateRank: 2,
    level: 25n,
    point: 1234n,
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
      meta: {
        id: "999999999999999999",
        name: "未登録サーバー",
        avatarUrl: undefined,
      } satisfies GuildMeta,
      record: null,
    },
  }}
/>
