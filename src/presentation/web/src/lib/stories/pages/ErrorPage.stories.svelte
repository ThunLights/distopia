<script lang="ts" module>
  import ErrorPage from "../../../routes/+error.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const { Story } = defineMeta({
    title: "Pages/Error",
    component: ErrorPage,
  });
</script>

<Story
  name="NotFound"
  parameters={{
    sveltekit_experimental: {
      state: {
        page: {
          status: 404,
          error: { message: "ページが見つかりません" },
        },
      },
    },
  }}
/>

<Story
  name="ServerError"
  parameters={{
    sveltekit_experimental: {
      state: {
        page: {
          status: 500,
          error: { message: "サーバーエラーが発生しました" },
        },
      },
    },
  }}
/>

<Story
  name="Forbidden"
  parameters={{
    sveltekit_experimental: {
      state: {
        page: {
          status: 403,
          error: { message: "アクセスが拒否されました" },
        },
      },
    },
  }}
/>
