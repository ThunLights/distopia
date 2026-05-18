<script module>
  import Terms from "./Terms.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Components/Main/Terms",
    component: Terms,
  });
</script>

<Story name="Primary" />
