<script lang="ts">
  import Banner from "$lib/components/Banner.svelte";
  import Card from "$lib/components/Guild/Card.svelte";
  import CardLayout from "$lib/components/Layout/CardLayout.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import Search from "$lib/components/Search.svelte";

  const { data } = $props();
  const { latestGuilds, activeGuilds, user } = $derived(data);
  let searchWord = $state("");

  function search(term: string) {
    return () => {
      location.href = `/search?w=${encodeURIComponent(term)}`;
    };
  }
</script>

<Meta title="Home" />

<Banner />
<div class="content">
  <div>
    <p class="title">あなたにピッタリなDiscordサーバーを見つける</p>
    <Search {searchWord} func={search} />
  </div>
  <div>
    <p class="title">最近更新されたサーバー</p>
    <CardLayout>
      {#each latestGuilds as guild (guild.guildId)}
        <Card {...guild} {user} iconUrl={guild.iconUrl ?? null} />
      {/each}
    </CardLayout>
  </div>
  <div>
    <p class="title">アクティブなサーバー</p>
    <CardLayout>
      {#each activeGuilds as guild (guild.guildId)}
        <Card {...guild} {user} iconUrl={guild.iconUrl ?? null} />
      {/each}
    </CardLayout>
  </div>
</div>

<style>
  .content {
    overflow: hidden;
    width: 95%;
    margin: 30px auto;
  }
  .title {
    margin-top: 14px;
    font-size: 30px;
    font-weight: 700;
  }
</style>
