<script module>
  import { mockUser, mockGuildCards } from "../../../mocks/data";
  import Page from "../../../routes/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Home",
    component: Page,
  });
</script>

<Story
  name="ログイン済み"
  args={{
    data: {
      user: mockUser,
      latestGuilds: mockGuildCards,
      activeGuilds: [...mockGuildCards].reverse(),
    },
  }}
/>

<Story
  name="ゲスト"
  args={{
    data: {
      user: null,
      latestGuilds: mockGuildCards,
      activeGuilds: [],
    },
  }}
/>

<Story
  name="サーバーなし"
  args={{
    data: {
      user: null,
      latestGuilds: [],
      activeGuilds: [],
    },
  }}
/>
