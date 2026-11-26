<script lang="ts">
  import { parseErrRes } from "#lib/client/error.js";
  import Block from "#lib/components/Block.svelte";
  import Card from "#lib/components/Guild/Card.svelte";
  import CardLayout from "#lib/components/Layout/CardLayout.svelte";
  import Meta from "#lib/components/Meta.svelte";
  import Search from "#lib/components/Search.svelte";
  import { setQuery } from "#lib/shared/query.js";
  import type {
    Guild,
    PostBody,
    ResponseMethodPost,
  } from "#lib/shared/types/routes/api/guild/search.js";

  const { data } = $props();
  const { user } = $derived(data);
  let word = $derived(data.word ?? "");
  let guilds = $state<Guild[]>([]);
  // Only the newest search may write `guilds`; an older response can resolve after it.
  let generation = 0;

  function navigate(term: string, tagOnly: boolean) {
    return setQuery({ w: encodeURIComponent(term), tag: tagOnly ? "1" : null });
  }

  function search(term: string) {
    return () => navigate(term, data.serverTag);
  }

  async function fetchGuilds(term: string, tagOnly: boolean) {
    const current = ++generation;

    // Tag mode lists every tagged server when no term is given, like /guilds/tags.
    if (!term.length && !tagOnly) {
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
        serverTag: tagOnly,
      } satisfies PostBody),
    });

    if (response.status === 200) {
      const res = (await response.json()) as ResponseMethodPost;
      if (current === generation) {
        guilds = res.guilds;
      }
    } else if (response.status === 400) {
      await parseErrRes(response);
    }
  }

  // The URL is the single source of truth: searching, the checkbox, tag links and back/forward
  // all navigate, and each navigation brings a new `data`.
  $effect(() => {
    void fetchGuilds(data.word ?? "", data.serverTag);
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
  <label class="option">
    <input
      type="checkbox"
      checked={data.serverTag}
      onchange={(e) => navigate(word, e.currentTarget.checked)}
    />
    サーバータグのあるサーバーのみ
  </label>
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
  .option {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    color: white;
  }
  .guilds-count {
    text-align: right;
  }
  p {
    color: white;
  }
</style>
