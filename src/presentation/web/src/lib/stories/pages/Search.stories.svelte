<script module>
  import { globalFetchMock } from "../../../mocks/fetch";
  import Page from "../../../routes/search/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { spyOn } from "storybook/test";

  const { Story } = defineMeta({
    title: "Pages/Search",
    component: Page,
  });
</script>

<Story name="検索結果あり" args={{ data: { word: "テスト", user: null } }} />

<Story
  name="検索結果なし"
  args={{ data: { word: "存在しないワード", user: null } }}
  beforeEach={() => {
    const spy = spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      if (String(input).includes("/api/guild/search")) {
        return new Response(JSON.stringify({ guilds: [], time: "0.01", count: 0 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return globalFetchMock(input, init);
    });
    return () => spy.mockRestore();
  }}
/>

<Story name="キーワードなし" args={{ data: { word: null, user: null } }} />
