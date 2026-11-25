<script lang="ts" module>
  import { mockGuildCards, mockUser } from "../../../mocks/data";
  import Page from "../../../routes/guilds/tags/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const mockBadgeUrl = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" fill="#5865f2"/></svg>',
  )}`;

  const serverTags = ["ALPH", "BETA", "GMMA", "DLTA"];
  const mockTaggedGuilds = mockGuildCards.map((guild, index) => ({
    ...guild,
    serverTag: serverTags[index % serverTags.length] ?? null,
    serverTagBadgeUrl: index % 2 === 0 ? mockBadgeUrl : null,
  }));

  const { Story } = defineMeta({
    title: "Pages/GuildTags",
    component: Page,
  });
</script>

<Story name="ゲスト表示" args={{ data: { user: null, guilds: mockTaggedGuilds } }} />

<Story name="ログイン済み表示" args={{ data: { user: mockUser, guilds: mockTaggedGuilds } }} />

<Story name="タグ付きサーバーなし" args={{ data: { user: null, guilds: [] } }} />
