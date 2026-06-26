<script lang="ts" module>
  import Page from "../../../routes/help/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Help",
    component: Page,
  });
</script>

<Story name="ヘルプ" />
