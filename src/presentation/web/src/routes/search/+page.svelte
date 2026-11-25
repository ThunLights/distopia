<script lang="ts">
  import { parseErrRes } from "#lib/client/error.js";
  import Block from "#lib/components/Block.svelte";
  import Card from "#lib/components/Guild/Card.svelte";
  import CardLayout from "#lib/components/Layout/CardLayout.svelte";
  import Meta from "#lib/components/Meta.svelte";
  import Search from "#lib/components/Search.svelte";
  import type {
    Guild,
    PostBody,
    ResponseMethodPost,
  } from "#lib/shared/types/routes/api/guild/search.js";
  import { untrack } from "svelte";

  const { data } = $props();
  const { user } = $derived(data);
  let word = $derived(data.word ?? "");
  let serverTag = $derived(data.serverTag);
  let guilds = $state<Guild[]>([]);
  let lastTerm = "";
  // Only the newest search may write `guilds`; an older response can resolve after it.
  let generation = 0;

  function search(term: string) {
    return async () => {
      lastTerm = term;
      const current = ++generation;
      // Untracked so the $effect below re-runs on navigation only; the checkbox re-searches itself.
      const tagOnly = untrack(() => serverTag);
      const url = new URL(window.location.href);
      url.searchParams.set("w", encodeURIComponent(term));
      if (tagOnly) {
        url.searchParams.set("tag", "1");
      } else {
        url.searchParams.delete("tag");
      }
      window.history.pushState({}, "", url);

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
    };
  }

  // Tag links navigate client-side (component isn't remounted), so onMount alone wouldn't
  // re-fetch. Every navigation brings a new `data`, even when only `tag` changed, so search
  // the URL's term and filter on each one.
  $effect(() => {
    const term = data.word ?? "";
    untrack(() => search(term)());
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
    <input type="checkbox" bind:checked={serverTag} onchange={() => search(lastTerm)()} />
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
