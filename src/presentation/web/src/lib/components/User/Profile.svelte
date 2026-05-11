<script lang="ts">
  import type { UserAuth } from "$lib/shared/types/UserAuth";
  import type { Snippet } from "svelte";

  type Props = {
    user: UserAuth;
    children?: Snippet;
  };

  const { user, children }: Props = $props();
</script>

<div class="profile">
  <div class="profile-contents">
    <div class="profile-content">
      <img class="icon" src={user.avatarUrl ?? "/discord/webp"} alt="" />
    </div>
    <div class="profile-content">
      <p class="profile-title">「 {user.username} 」でログイン中</p>
      <p>ID: {user.id}</p>
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
