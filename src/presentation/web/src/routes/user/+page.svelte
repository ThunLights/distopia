<script lang="ts">
  import { deleteAuth } from "$lib/client/auth.js";
  import Block from "$lib/components/Block.svelte";
  import LinkButton from "$lib/components/Button/LinkButton.svelte";
  import PrimaryButton from "$lib/components/Button/PrimaryButton.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import SubTitle from "$lib/components/SubTitle.svelte";
  import Guild from "$lib/components/User/Guild.svelte";
  import Profile from "$lib/components/User/Profile.svelte";

  const { data } = $props();
  const { user, guilds } = $derived(data);

  const title = $derived(`「${user.username}」の詳細情報`);
  const publicGuilds = $derived(guilds.filter(({ isPublic }) => isPublic));
  const canPublishGuilds = $derived(guilds.filter(({ isBotJoined }) => isBotJoined));
  const publicGuildCount = $derived(publicGuilds.length);
  const canPublishGuildCount = $derived(canPublishGuilds.length);

  async function logout() {
    await deleteAuth();
    location.href = "/";
  }
</script>

<Meta {title} />

<Profile {user}>
  <p>公開サーバー: {publicGuildCount}</p>
  <p>公開可能サーバー: {canPublishGuildCount}</p>
</Profile>
<Block>
  <SubTitle content="アカウント操作" />
  <div>
    <LinkButton label="アカウント設定" rel="internal" link="/user/settings" />
    <PrimaryButton onclick={logout}>ログアウト</PrimaryButton>
  </div>
</Block>
<Block>
  <SubTitle content="公開サーバー" />
  <div class="guilds">
    {#if publicGuildCount}
      {#each publicGuilds as guild (guild.id)}
        <Guild
          id={guild.id}
          name={guild.name}
          icon={guild.icon}
          activeMemberCount={guild.approximate_presence_count}
          memberCount={guild.approximate_member_count}
        />
      {/each}
    {:else}
      <p>公開サーバーが見つかりません</p>
    {/if}
  </div>
</Block>
<Block>
  <SubTitle content="サーバー" />
  <div class="guilds">
    {#if canPublishGuildCount}
      {#each canPublishGuilds as guild (guild.id)}
        <Guild
          id={guild.id}
          name={guild.name}
          icon={guild.icon}
          activeMemberCount={guild.approximate_presence_count}
          memberCount={guild.approximate_member_count}
        >
          <p class="is-bot-joined inline-block">
            {guild.isBotJoined ? "ボット導入" : "ボット未導入"}
          </p>
        </Guild>
      {/each}
    {:else}
      <p>サーバーが見つかりません</p>
    {/if}
  </div>
</Block>

<style>
  .guilds {
    width: 95%;
    margin: 20px auto;
  }
  .is-bot-joined {
    font-size: 8px;
  }
  .inline-block {
    display: inline-block;
  }
  p {
    text-decoration: none;
    color: white;
  }
</style>
