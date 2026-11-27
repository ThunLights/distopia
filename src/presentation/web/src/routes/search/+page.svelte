<script lang="ts">
  import { parseErrRes } from "#lib/client/error.js";
  import Block from "#lib/components/Block.svelte";
  import Card from "#lib/components/Guild/Card.svelte";
  import CardLayout from "#lib/components/Layout/CardLayout.svelte";
  import Meta from "#lib/components/Meta.svelte";
  import Search from "#lib/components/Search.svelte";
  import { setQuery } from "#lib/shared/query.js";
  import {
    SEARCH_PAGE_SIZE,
    type Guild,
    type PostBody,
    type ResponseMethodPost,
  } from "#lib/shared/types/routes/api/guild/search.js";

  const { data } = $props();
  const { user } = $derived(data);
  let word = $derived(data.word ?? "");
  let guilds = $state<Guild[]>([]);
  let total = $state(0);
  const lastPage = $derived(Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE)));
  // Only the newest search may write `guilds`; an older response can resolve after it.
  let generation = 0;

  // The user's latest intent; ahead of `data` while a navigation is still pending.
  let latest = { term: "", tagOnly: false };

  // A new term or filter starts over at page 1.
  function navigate(term: string, tagOnly: boolean) {
    latest = { term, tagOnly };
    // goto to the committed URL reuses its load data, so the $effect wouldn't re-fetch.
    if (term === word && tagOnly === data.serverTag && data.page === 1) {
      return fetchGuilds(term, tagOnly, 1);
    }
    return setQuery({ w: term, tag: tagOnly ? "1" : null, p: null });
  }

  function goToPage(page: number) {
    return setQuery({ p: page === 1 ? null : String(page) });
  }

  function search(term: string) {
    return () => navigate(term, latest.tagOnly);
  }

  async function fetchGuilds(term: string, tagOnly: boolean, page: number) {
    const current = ++generation;

    // Tag mode lists every tagged server when no term is given, like /guilds/tags.
    if (!term.length && !tagOnly) {
      guilds = [];
      total = 0;
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
        page,
      } satisfies PostBody),
    });

    if (response.status === 200) {
      const res = (await response.json()) as ResponseMethodPost;
      if (current === generation) {
        guilds = res.guilds;
        total = res.count;
      }
    } else if (response.status === 400) {
      await parseErrRes(response);
    }
  }

  // The URL is the single source of truth: searching, the checkbox, tag links and back/forward
  // all navigate, and each navigation brings a new `data`.
  $effect(() => {
    latest = { term: data.word ?? "", tagOnly: data.serverTag };
    void fetchGuilds(latest.term, latest.tagOnly, data.page);
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
      onchange={(e) => navigate(latest.term, e.currentTarget.checked)}
    />
    サーバータグのあるサーバーのみ
  </label>
  <div class="guilds-count">
    <p>{total}件のサーバーがヒット</p>
  </div>
  <CardLayout>
    {#each guilds as guild (guild.guildId)}
      <Card {...guild} rank={guild.rank} {user} />
    {/each}
  </CardLayout>
  {#if lastPage > 1}
    <nav class="pager" aria-label="ページ">
      <button
        type="button"
        disabled={data.page <= 1}
        onclick={() => goToPage(Math.min(data.page - 1, lastPage))}>前へ</button
      >
      <span>{data.page} / {lastPage}</span>
      <button type="button" disabled={data.page >= lastPage} onclick={() => goToPage(data.page + 1)}
        >次へ</button
      >
    </nav>
  {/if}
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
  .pager {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 16px;
    color: white;
  }
  .pager button {
    padding: 6px 16px;
    border: 1px solid rgb(66, 66, 66);
    border-radius: 6px;
    background-color: var(--surface-color);
    color: white;
    font-weight: 700;
    cursor: pointer;
  }
  .pager button:disabled {
    opacity: 0.4;
    cursor: default;
  }
</style>
