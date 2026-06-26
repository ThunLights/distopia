<script lang="ts" module>
  import Page from "../../../routes/help/register/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Help/Register",
    component: Page,
  });
</script>

<Story name="サーバー登録の仕方" />
