<script lang="ts">
  import DiscordIcon from "$lib/assets/icon/discord.webp";
  import type { Snippet } from "svelte";

  type Props = {
    id: string;
    displayName: string;
    username: string;
    index: number;
    avatarUrl?: string;
    children?: Snippet;
  };

  const { id, avatarUrl, displayName, username, index, children }: Props = $props();
</script>

<div class="user">
  <div>
    <img class="icon" src={avatarUrl ?? DiscordIcon} alt="" />
  </div>
  <div>
    <p class="name white">{index + 1}: {displayName}</p>
    <div class="informations">
      {#if children}
        {@render children()}
      {/if}
      <p>ユーザーネーム: {username} (ID: {id})</p>
    </div>
  </div>
</div>

<style>
  .white {
    color: white;
  }
  .user .name {
    font-size: 20px;
    font-weight: 700;
  }
  .user .icon {
    border-radius: 50%;
    width: 10vw;
  }
  .user {
    margin-bottom: 10px;
    display: grid;
    gap: 20px;
    grid-template-columns: auto 1fr auto;
    align-items: center;
  }
  p {
    font-size: 15px;
    text-decoration: none;
    color: white;
  }
  @media (max-width: 800px) {
    .user .name {
      font-size: 16px;
    }
  }
  @media (max-width: 600px) {
    .user .name {
      font-size: 14px;
    }
    p {
      font-size: 10px;
    }
  }
  @media (max-width: 450px) {
    .user .name {
      font-size: 12px;
    }
    p {
      font-size: 8px;
    }
  }
</style>
