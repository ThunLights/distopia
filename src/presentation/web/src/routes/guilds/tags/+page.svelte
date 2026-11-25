<script lang="ts">
  import Card from "#lib/components/Guild/Card.svelte";
  import CardLayout from "#lib/components/Layout/CardLayout.svelte";
  import Meta from "#lib/components/Meta.svelte";
  import Search from "#lib/components/Search.svelte";
  import { resolve } from "$app/paths";

  const { data } = $props();
  const { guilds, user } = $derived(data);

  function search(term: string) {
    return () => {
      location.href = `${resolve("/search")}?w=${encodeURIComponent(term)}&tag=1`;
    };
  }
</script>

<Meta title="サーバータグ" description="サーバータグを持つDiscordサーバーの一覧です。" />

<div class="content">
  <div>
    <p class="title">サーバータグで探す</p>
    <Search searchWord="" func={search} />
  </div>
  <div>
    <p class="title">サーバータグのあるサーバー</p>
    <CardLayout>
      {#each guilds as guild (guild.guildId)}
        <Card {...guild} {user} />
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
