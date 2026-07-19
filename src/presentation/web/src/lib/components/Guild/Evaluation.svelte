<script lang="ts">
  import Star from "$lib/assets/icon/star.webp";
  import Block from "$lib/components/Block.svelte";
  import BlockTitle from "$lib/components/Guild/BlockTitle.svelte";

  type Props = {
    reviews: number[];
  };

  const { reviews }: Props = $props();

  let starAvg = $derived(
    reviews.length
      ? (reviews.reduce((sum, star) => sum + star, 0) / reviews.length).toFixed(2)
      : "レビューなし",
  );
  let title = $derived(`評価: ${starAvg}`);
</script>

<Block>
  <BlockTitle {title} />
  {#each [0, 1, 2, 3, 4] as star (star)}
    <div class="star">
      <p><img src={Star} alt="star" />{star + 1}</p>
      <p>
        <progress max={reviews.length} value={reviews.filter((value) => value === star + 1).length}
        ></progress>
        {reviews.filter((value) => value === star + 1).length}個
      </p>
    </div>
  {/each}
</Block>

<style>
  .star {
    font-size: 20px;
  }
  .star img {
    width: 20px;
  }
  .star p {
    font-size: 15px;
    display: inline-block;
  }
</style>
