<script module>
  import Page from "../../../routes/friends/+page.svelte";
  import { defineMeta } from "@storybook/addon-svelte-csf";

  const mockFriends = [
    {
      userId: "111111111111111111",
      username: "フレンド募集さん",
      description: "ゲームが好きです。一緒に遊べる方を探しています！",
      nsfw: false,
      avatarUrl: null,
      tags: ["ゲーム", "FPS", "RPG"],
    },
    {
      userId: "222222222222222222",
      username: "アニメ好き",
      description: "アニメやマンガについて語り合える友達が欲しいです。",
      nsfw: false,
      avatarUrl: null,
      tags: ["アニメ", "マンガ", "声優"],
    },
    {
      userId: "333333333333333333",
      username: "プログラマー",
      description: "エンジニア仲間を探しています。TypeScriptが好きです。",
      nsfw: false,
      avatarUrl: null,
      tags: ["プログラミング", "TypeScript", "Web開発"],
    },
  ];

  const { Story } = defineMeta({
    title: "Pages/Friends",
    component: Page,
  });
</script>

<Story name="フレンド一覧" args={{ data: { friends: mockFriends, user: null } }} />

<Story name="フレンドなし" args={{ data: { friends: [], user: null } }} />
