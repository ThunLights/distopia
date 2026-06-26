<script module>
  import { mockUser, mockUserGuilds } from "../../../mocks/data";
  import Page from "../../../routes/user/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/User/Profile",
    component: Page,
  });
</script>

<Story
  name="サーバーあり"
  args={{
    data: { user: mockUser, guilds: mockUserGuilds },
  }}
/>

<Story
  name="サーバーなし"
  args={{
    data: { user: mockUser, guilds: [] },
  }}
/>
