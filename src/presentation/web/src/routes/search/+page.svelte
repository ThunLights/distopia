<script lang="ts">
  import { parseErrRes } from "$lib/client/error.js";
  import Block from "$lib/components/Block.svelte";
  import Card from "$lib/components/Guild/Card.svelte";
  import CardLayout from "$lib/components/Layout/CardLayout.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import Search from "$lib/components/Search.svelte";
  import type {
    Guild,
    PostBody,
    ResponseMethodPost,
  } from "$lib/shared/types/routes/api/guild/search";

  const { data } = $props();
  const { user } = $derived(data);
  let word = $derived(data.word ?? "");
  let guilds = $state<Guild[]>([]);

  function search(term: string) {
    return async () => {
      const url = new URL(window.location.href);
      url.searchParams.set("w", encodeURIComponent(term));
      window.history.pushState({}, "", url);

      if (!term.length) {
        guilds = [];
        return;
      }

      const response = await fetch("/api/guild/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term,
          type: "all",
        } satisfies PostBody),
      });

      if (response.status === 200) {
        const res = (await response.json()) as ResponseMethodPost;
        guilds = res.guilds;
      } else if (response.status === 400) {
        await parseErrRes(response);
      }
    };
  }

  // Tag links navigate client-side (component isn't remounted), so onMount alone
  // wouldn't re-fetch when `word` changes. React to it instead.
  $effect(() => {
    search(word)();
  });
</script>

<Meta
  title={`「${word}」の検索結果を表示`}
  description={[
    `「${word}」の検索結果です。`,
    "現在沢山のサーバーが登録されています。",
    "他ワードも試してみてください。",
  ].join("")}
/>

<Block>
  <Search searchWord={word} func={search} />
  <div class="guilds-count">
    <p>{guilds.length}件のサーバーがヒット</p>
  </div>
  <CardLayout>
    {#each guilds as guild (guild.guildId)}
      <Card {...guild} rank={guild.rank} {user} />
    {/each}
  </CardLayout>
</Block>

<style>
  .guilds-count {
    text-align: right;
  }
  p {
    color: white;
  }
</style>
