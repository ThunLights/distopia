<script lang="ts" module>
  import { mockUser } from "../../../mocks/data";
  import Page from "../../../routes/user/settings/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/User/Settings",
    component: Page,
  });
</script>

<Story name="設定ページ" args={{ data: { user: mockUser } }} />
