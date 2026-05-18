<script lang="ts">
  import BlackStar from "$lib/assets/icon/blackstar.webp";
  import DiscordIcon from "$lib/assets/icon/discord.webp";
  import Star from "$lib/assets/icon/star.webp";

  type Props = {
    username: string | null;
    avatarUrl: string | null;
    star: number;
    content: string | null;
  };

  const { username, avatarUrl, star, content }: Props = $props();
</script>

<div class="review">
  <div class="content">
    <div class="user">
      <div>
        <img class="icon" src={avatarUrl ?? DiscordIcon} alt="" />
      </div>
      <div>
        <p class="name">{username ?? "unknown user"}</p>
      </div>
    </div>
    <div class="stars">
      <div class="inline-block">
        <p class="section-title">評価</p>
      </div>
      {#each [0, 1, 2, 3, 4] as i (i)}
        <div class="star inline-block">
          <img src={i + 1 <= star ? Star : BlackStar} alt="" />
        </div>
      {/each}
    </div>
    {#if content}
      <div>
        <p class="section-title">内容</p>
        <pre>{content}</pre>
      </div>
    {/if}
  </div>
</div>

<style>
  .star img {
    width: 20px;
  }
  .content {
    overflow: hidden;
    margin: 10px 20px;
  }
  .review {
    overflow: hidden;
    border-radius: 20px;
    background-color: rgb(46, 46, 46);
    margin-top: 12px;
  }
  .review .user > div {
    display: inline-block;
  }
  .review .user .icon {
    margin: 0;
    height: 22px;
    border-radius: 25%;
  }
  .review .user .name {
    margin: 0;
    line-height: 16px;
    font-size: 16px;
    font-weight: 500;
  }
  .section-title {
    font-weight: 700;
  }
  .inline-block {
    display: inline-block;
  }
</style>
