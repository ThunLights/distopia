<script lang="ts" module>
  import Page from "../../../routes/other/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Other",
    component: Page,
  });
</script>

<Story name="その他リンク" />
