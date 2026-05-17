<script lang="ts">
  import { parseErrRes } from "$lib/client/error.js";
  import Block from "$lib/components/Block.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import Guild from "$lib/components/Ranking/Guild.svelte";
  import User from "$lib/components/Ranking/User.svelte";
  import type {
    GuildRanking,
    ResponseMethodGet,
    UserRanking,
  } from "$lib/shared/types/routes/api/ranking";
  import { onMount } from "svelte";

  const { data } = $props();
  let rankingType = $derived<"userbump" | "level" | "rate">(parseRankingType(data.rankingType));
  let userBump = $state<UserRanking[]>([]);
  let guildLevel = $state<GuildRanking[]>([]);
  let guildActiveRate = $state<GuildRanking[]>([]);

  onMount(async () => {
    const response = await fetch("/api/ranking", {
      method: "GET",
    });
    if (response.status === 200) {
      const { guild, user } = (await response.json()) as ResponseMethodGet;
      userBump = user.bump;
      guildLevel = guild.level;
      guildActiveRate = guild.activeRate;
    } else if (response.status) {
      await parseErrRes(response);
    }
  });

  function parseRankingType(ty: string | null) {
    return ty === "userbump" ? "userbump" : ty === "level" ? "level" : "rate";
  }
</script>

<Meta title="サーバーランキング" />

<Block>
  <div class="menu">
    <p class="title">ランキング</p>
    <div class="search-type-changer">
      <select bind:value={rankingType}>
        <option value="level">レベル</option>
        <option value="activeRate">アクティブレート</option>
        <option value="userBump">ユーザーBumpランキング</option>
      </select>
    </div>
  </div>
  <div class="ranking">
    {#if rankingType === "userbump"}
      {#each userBump as user, index (user.id)}
        <User {...user} rank={index + 1}>
          <p>合計: {user.bumpCounter ?? 0}回</p>
        </User>
      {/each}
    {:else if rankingType === "level"}
      {#each guildLevel as guild, index (guild.guildId)}
        <Guild {...guild} useFrameIcon={false} rank={index + 1} />
      {/each}
    {:else}
      {#each guildActiveRate as guild, index (guild.guildId)}
        <Guild {...guild} useFrameIcon={true} rank={index + 1} />
      {/each}
    {/if}
  </div>
</Block>

<style>
  .title {
    font-size: 30px;
    font-weight: 700;
    margin-top: 10px;
  }
  .search-type-changer select {
    color: rgb(201, 201, 201);
    border-radius: 25px;
    background-color: rgb(85, 85, 85);
    padding: 5px 10px;
    font-weight: 700;
  }
  .search-type-changer {
    text-align: right;
  }
  .menu {
    margin-bottom: 18px;
  }
  p {
    font-size: 15px;
    text-decoration: none;
    color: white;
  }
  @media (max-width: 600px) {
    p {
      font-size: 10px;
    }
  }
  @media (max-width: 450px) {
    p {
      font-size: 8px;
    }
  }
</style>
