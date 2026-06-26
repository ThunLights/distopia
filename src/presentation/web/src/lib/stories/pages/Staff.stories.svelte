<script module>
  import Page from "../../../routes/staff/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Staff",
    component: Page,
  });
</script>

<Story name="スタッフ一覧" args={{ data: { user: null } }} />
