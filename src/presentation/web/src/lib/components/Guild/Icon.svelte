<script lang="ts">
  import No1Frame from "$lib/assets/ranking/mini/1.webp";
  import No2Frame from "$lib/assets/ranking/mini/2.webp";
  import No3Frame from "$lib/assets/ranking/mini/3.webp";
  import No10Frame from "$lib/assets/ranking/mini/10.webp";
  import No30Frame from "$lib/assets/ranking/mini/30.webp";
  import No50Frame from "$lib/assets/ranking/mini/50.webp";
  import type { DiscordIconSize } from "$lib/utils/discordIcon";
  import DiscordIcon from "./DiscordIcon.svelte";
  import IconWithFrame from "./IconWithFrame.svelte";

  type Props = {
    height: number | string;
    width: number | string;
    rank?: number;
    iconUrl: string | null | undefined;
    size?: DiscordIconSize;
    imgStyle?: string;
  };

  const { imgStyle, iconUrl, size = 128, rank, height, width }: Props = $props();

  const framePaddingRatio = 0.2;

  function genFrame(rank: number) {
    if (rank <= 1) return No1Frame;
    if (rank <= 2) return No2Frame;
    if (rank <= 3) return No3Frame;
    if (rank <= 10) return No10Frame;
    if (rank <= 30) return No30Frame;
    return No50Frame;
  }
</script>

{#if rank && rank <= 50}
  <IconWithFrame {height} {width} {iconUrl} {size} {imgStyle} edgePath={genFrame(rank)} />
{:else}
  <div
    class="guild-icon-wrapper"
    style={[
      imgStyle,
      `height: ${height}`,
      `width: ${width}`,
      `padding: ${framePaddingRatio * 100}%`,
    ].join("; ")}
  >
    <DiscordIcon {iconUrl} {size} alt="guild icon" class="guild-icon" />
  </div>
{/if}

<style>
  .guild-icon-wrapper {
    box-sizing: border-box;
  }

  :global(.guild-icon) {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
</style>
