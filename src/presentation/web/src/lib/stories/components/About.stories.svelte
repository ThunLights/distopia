<script lang="ts" module>
  import About from "../../components/Main/About.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Components/Main/About",
    component: About,
  });
</script>

<Story name="Primary" />
