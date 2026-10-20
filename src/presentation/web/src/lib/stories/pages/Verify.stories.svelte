<script lang="ts" module>
  import { mockUser } from "../../../mocks/data";
  import Page from "../../../routes/verify/[guildId]/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Verify",
    component: Page,
  });

  const data = {
    user: mockUser,
    guildId: "123456789012345678",
    guildName: "Distopia Server",
    iconUrl: undefined,
    clientPlugin: null,
  };
</script>

<Story name="認証待ち" args={{ data }} />

<Story
  name="長いサーバー名"
  args={{ data: { ...data, guildName: "とても長い名前のサーバー ".repeat(4) } }}
/>
