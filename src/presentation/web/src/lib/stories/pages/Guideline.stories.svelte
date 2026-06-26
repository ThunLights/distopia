<script lang="ts" module>
  import Page from "../../../routes/guideline/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Guideline",
    component: Page,
  });
</script>

<Story name="ガイドライン" />
