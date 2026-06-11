<script lang="ts">
  import CopyIcon from "$lib/assets/icon/copy.webp";
  import DiscordIcon from "$lib/assets/icon/discord.webp";
  import Block from "$lib/components/Block.svelte";
  import Copy from "../Button/Copy.svelte";
  import TagsLayout from "../Layout/TagsLayout.svelte";

  type Props = {
    friend: {
      userId: string;
      username: string;
      description: string;
      nsfw: boolean;
      avatarUrl: string | null;
      tags: string[];
    };
  };

  const { friend }: Props = $props();
</script>

<Block>
  <div class="friend-content">
    <div class="profile">
      <div>
        <img class="icon" src={friend.avatarUrl ?? DiscordIcon} alt="" />
      </div>
      <div>
        <p class="username">
          {friend.username}
          <Copy copyTxt={friend.username}><img src={CopyIcon} alt="" /></Copy>
        </p>
        <p>
          ID: {friend.userId}
          {#if friend.nsfw}
            <small style="color: red;">nsfw!</small>
          {/if}
        </p>
      </div>
    </div>
    {#if friend.tags.length}
      <TagsLayout tags={friend.tags} />
    {/if}
    <div class="description">
      <p>自己紹介</p>
      <pre>{friend.description}</pre>
    </div>
  </div>
</Block>

<style>
  .username {
    font-weight: 700;
    line-height: 16px;
  }
  .username img {
    cursor: pointer;
    height: 16px;
  }
  .friend-content {
    overflow: hidden;
    margin: 6px 12px;
  }
  .friend-content .icon {
    height: 65px;
    border-radius: 50%;
  }
  .friend-content .profile > div {
    display: inline-block;
  }
  .friend-content > div {
    margin: 10px 0;
  }
  p,
  pre {
    color: white;
  }
</style>
