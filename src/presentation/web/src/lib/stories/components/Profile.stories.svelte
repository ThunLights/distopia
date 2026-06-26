<script lang="ts" module>
  import Icon from "$lib/assets/staff/robot.webp";
  import Profile from "../../components/Staff/Profile.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Components/Staff/Profile",
    component: Profile,
  });
</script>

<Story
  name="Primary"
  args={{
    staff: {
      name: "Example",
      description: "this is a test user",
      icon: Icon,
      link: [
        {
          icon: Icon,
          url: "http://example.com",
        },
      ],
    },
  }}
/>
