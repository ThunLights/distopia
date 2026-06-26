<script module>
  import Page from "../../../routes/supporter/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Supporter",
    component: Page,
  });
</script>

<Story name="支援団体一覧" args={{ data: { user: null } }} />
