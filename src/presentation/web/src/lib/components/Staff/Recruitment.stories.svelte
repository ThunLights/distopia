<script module>
  import Recruitment from "./Recruitment.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Components/Staff/Recruitment",
    component: Recruitment,
  });
</script>

<Story name="Primary" />
