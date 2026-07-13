<script lang="ts">
  import No1Frame from "$lib/assets/ranking/1.webp";
  import No2Frame from "$lib/assets/ranking/2.webp";
  import No3Frame from "$lib/assets/ranking/3.webp";
  import No10Frame from "$lib/assets/ranking/10.webp";
  import No30Frame from "$lib/assets/ranking/30.webp";
  import No50Frame from "$lib/assets/ranking/50.webp";
  import IconWithFrame from "./IconWithFrame.svelte";

  type Props = {
    height: number | string;
    width: number | string;
    rank?: number;
    iconPath: string;
    imgStyle?: string;
  };

  const { imgStyle, iconPath, rank, height, width }: Props = $props();

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
  <IconWithFrame {height} {width} {iconPath} {imgStyle} edgePath={genFrame(rank)} />
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
    <img class="guild-icon" src={iconPath} alt="guild icon" />
  </div>
{/if}

<style>
  .guild-icon-wrapper {
    box-sizing: border-box;
  }

  .guild-icon {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
</style>
