<script lang="ts" module>
  import { mockUser, mockGuildCards } from "../../../mocks/data";
  import Page from "../../../routes/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  // Home page load function returns iconUrl: string | undefined (from meta.iconUrl),
  // while the search API Guild type uses iconUrl: string | null. Map here to match.
  const homeGuilds = mockGuildCards.map(({ iconUrl, ...rest }) => ({
    ...rest,
    iconUrl: iconUrl ?? undefined,
  }));

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
      latestGuilds: homeGuilds,
      activeGuilds: [...homeGuilds].reverse(),
    },
  }}
/>

<Story
  name="ゲスト"
  args={{
    data: {
      user: null,
      latestGuilds: homeGuilds,
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
