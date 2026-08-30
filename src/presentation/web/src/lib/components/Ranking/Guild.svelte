<script lang="ts">
  import { resolve } from "$app/paths";
  import DiscordIcon from "../Guild/DiscordIcon.svelte";
  import Icon from "../Guild/Icon.svelte";

  type Props = {
    guildId: string;
    name: string;
    useFrameIcon: boolean;
    index: number;
    activeRate: number | null;
    level: number;
    point: number;
    memberCount: number | null;
    onlineMemberCount: number | null;
    iconUrl: string | null;
  };

  const {
    guildId,
    name,
    useFrameIcon,
    index,
    activeRate,
    level,
    point,
    memberCount,
    onlineMemberCount,
    iconUrl,
  }: Props = $props();
</script>

<div class="guild">
  <div>
    <a class="white" href={resolve(`/guilds/${guildId}`)} aria-label={name}>
      {#if useFrameIcon}
        <Icon width="10vw" height="10vw" {iconUrl} size={256} rank={index + 1} />
      {:else}
        <DiscordIcon {iconUrl} size={256} alt="" class="icon" />
      {/if}
    </a>
  </div>
  <div>
    <p><a class="name white" href={resolve(`/guilds/${guildId}`)}>{index + 1}: {name}</a></p>
    <div class="informations">
      <p>
        Rate {Number(activeRate ?? 0n)} Lv.{Number(level ?? 0n)}
        {Number(point ?? 0n)}pt
      </p>
      <p>{memberCount ?? 0}人(アクティブ: {onlineMemberCount ?? 0})</p>
    </div>
  </div>
  <div>
    <a href={resolve(`/guilds/${guildId}`)}><p class="move-page">詳細→</p></a>
  </div>
</div>

<style>
  .white {
    color: white;
  }
  .guild .name {
    font-size: 20px;
    font-weight: 700;
  }
  .guild :global(.icon) {
    border-radius: 50%;
    width: 10vw;
  }
  .guild {
    margin-bottom: 10px;
    display: grid;
    gap: 20px;
    grid-template-columns: auto 1fr auto;
    align-items: center;
  }
  .move-page {
    font-size: 20px;
  }
  a,
  p {
    font-size: 15px;
    text-decoration: none;
    color: white;
  }
  @media (max-width: 800px) {
    .guild .name {
      font-size: 16px;
    }
    .move-page {
      font-size: 14px;
    }
  }
  @media (max-width: 600px) {
    .guild .name {
      font-size: 14px;
    }
    .move-page {
      font-size: 12px;
    }
    p {
      font-size: 10px;
    }
  }
  @media (max-width: 450px) {
    .guild .name {
      font-size: 12px;
    }
    .move-page {
      font-size: 10px;
    }
    p {
      font-size: 8px;
    }
  }
</style>
