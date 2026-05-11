<script lang="ts">
  import { resolve } from "$app/paths";
  import type { Snippet } from "svelte";

  type Props = {
    id: string;
    name: string;
    icon: string | null;
    activeMemberCount?: number;
    memberCount?: number;
    children?: Snippet;
  };

  const { id, name, icon, activeMemberCount, memberCount, children }: Props = $props();
</script>

<div class="guild">
  <div>
    <a href={resolve(`/user/guild/${id}`)}>
      <img
        class="icon"
        src={icon ? `https://cdn.discordapp.com/icons/${id}/${icon}.webp` : "/discord.webp"}
        alt=""
      />
    </a>
  </div>
  <div>
    <p class="name"><a href={resolve(`/user/guild/${id}`)}>{name}</a></p>
    <div class="informations">
      <p>ID: {id}</p>
      <p>
        ユーザー数: {memberCount ?? "情報を取得できませんでした"} (アクティブ: {activeMemberCount ??
          "情報を取得できませんでした"})
      </p>
      <div>
        {#if children}
          {@render children()}
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .guild > div {
    display: inline-block;
  }
  .guild {
    margin-top: 10px;
  }
  .guild .icon {
    height: 64px;
    border-radius: 50%;
  }
  .guild .name {
    font-size: 14px;
  }
  .guild .informations p {
    font-size: 8px;
  }
  a,
  p {
    text-decoration: none;
    color: white;
  }
</style>
