<script lang="ts" module>
  import { mockUser } from "../../../mocks/data";
  import Page from "../../../routes/auth/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Auth",
    component: Page,
  });
</script>

<Story name="認証成功" args={{ data: { user: mockUser } }} />

<Story name="認証失敗" args={{ data: { user: null } }} />
