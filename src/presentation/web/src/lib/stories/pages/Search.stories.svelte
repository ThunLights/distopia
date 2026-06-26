<script lang="ts" module>
  import type { ResponseMethodPost } from "$lib/shared/types/routes/api/guild/search";
  import { globalFetchMock } from "../../../mocks/fetch";
  import Page from "../../../routes/search/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { spyOn } from "storybook/test";

  const { Story } = defineMeta({
    title: "Pages/Search",
    component: Page,
  });

  const mockGuild = {
    guildId: "111111111111111111",
    name: "テストサーバー Alpha",
    nsfw: false,
    description: "テスト用のDiscordサーバーです。ゲームやコミュニティ活動を行っています。",
    boostCount: 5,
    tags: ["ゲーム", "コミュニティ", "雑談"],
    iconUrl: null,
    rank: 2,
    invite: "https://discord.gg/example1",
  };
</script>

<Story name="検索結果あり" args={{ data: { word: "テスト", user: null } }} />

<Story
  name="検索結果なし"
  args={{ data: { word: "テスト", user: null } }}
  beforeEach={() => {
    const spy = spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      if (String(input).includes("/api/guild/search")) {
        return new Response(
          JSON.stringify({
            guilds: [mockGuild],
            time: "0.01",
            count: 0,
          } satisfies ResponseMethodPost),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      return globalFetchMock(input, init);
    });
    return () => spy.mockRestore();
  }}
/>

<Story name="キーワードなし" args={{ data: { word: null, user: null } }} />
