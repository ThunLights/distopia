<script lang="ts" module>
  import Page from "../../../routes/ranking/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Ranking",
    component: Page,
  });
</script>

<Story name="レベルランキング" args={{ data: { rankingType: "level", user: null } }} />

<Story name="アクティブレートランキング" args={{ data: { rankingType: "rate", user: null } }} />

<Story name="ユーザーBumpランキング" args={{ data: { rankingType: "userbump", user: null } }} />
