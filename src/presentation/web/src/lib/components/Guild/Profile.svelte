<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    guild: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
    children?: Snippet;
  };

  const { guild, children }: Props = $props();
</script>

<div class="profile">
  <div class="profile-contents">
    <div class="profile-content">
      <img class="icon" src={guild.avatarUrl ?? "/discord/webp"} alt="" />
    </div>
    <div class="profile-content">
      <p class="profile-title">{guild.name}</p>
      <p>ID: {guild.id}</p>
      {#if children}
        {@render children()}
      {/if}
    </div>
  </div>
</div>

<style>
  .profile-contents {
    margin: 25px 10px;
  }
  .profile-content {
    display: inline-block;
    margin-right: 12px;
  }
  .profile-title {
    font-size: 18px;
    margin-bottom: 5px;
  }
  .profile {
    overflow: hidden;
    background-color: rgb(40, 40, 40);
  }
  .profile .icon {
    border-radius: 50%;
  }
  p {
    text-decoration: none;
    color: white;
  }
</style>
