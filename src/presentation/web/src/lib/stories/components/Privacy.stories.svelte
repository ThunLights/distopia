<script lang="ts" module>
  import Privacy from "../../components/Main/Privacy.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Components/Main/Privacy",
    component: Privacy,
  });
</script>

<Story name="Primary" />
