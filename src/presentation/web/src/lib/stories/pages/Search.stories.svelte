<script lang="ts" module>
  import {
    SEARCH_PAGE_SIZE,
    type ResponseMethodPost,
  } from "#lib/shared/types/routes/api/guild/search.js";
  import { mockGuildCards } from "../../../mocks/data";
  import { globalFetchMock } from "../../../mocks/fetch";
  import Page from "../../../routes/search/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { spyOn } from "storybook/test";

  const { Story } = defineMeta({
    title: "Pages/Search",
    component: Page,
  });

  function mockSearch(body: ResponseMethodPost) {
    return () => {
      const spy = spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
        if (String(input).includes("/api/guild/search")) {
          return new Response(JSON.stringify(body), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        return globalFetchMock(input, init);
      });
      return () => spy.mockRestore();
    };
  }
</script>

<Story
  name="検索結果あり"
  args={{ data: { word: "テスト", user: null, serverTag: false, page: 1 } }}
/>

<Story
  name="検索結果なし"
  args={{ data: { word: "テスト", user: null, serverTag: false, page: 1 } }}
  beforeEach={mockSearch({ guilds: [], time: "0.01", count: 0 })}
/>

<Story
  name="複数ページ"
  args={{ data: { word: "テスト", user: null, serverTag: false, page: 2 } }}
  beforeEach={mockSearch({
    guilds: mockGuildCards,
    time: "0.05",
    count: SEARCH_PAGE_SIZE * 3,
  })}
/>

<Story
  name="サーバータグ検索"
  args={{ data: { word: "テスト", user: null, serverTag: true, page: 1 } }}
/>

<Story
  name="キーワードなし"
  args={{ data: { word: null, user: null, serverTag: false, page: 1 } }}
/>
