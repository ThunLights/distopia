<script lang="ts">
  import Block from "$lib/components/Block.svelte";
  import BlockTitle from "$lib/components/Guild/BlockTitle.svelte";
  import Evaluation from "$lib/components/Guild/Evaluation.svelte";
  import GuildBlock from "$lib/components/Guild/GuildBlock.svelte";
  import Review from "$lib/components/Guild/Review.svelte";
  import Meta from "$lib/components/Meta.svelte";

  const { data } = $props();
  const { meta, guild, record } = $derived(data);
  const { serverBoostCount: boostCount, iconUrl } = $derived(meta);
  const { guildId, name, nsfw, description, tags } = $derived(guild);

  const activeRate = $derived(Number(record?.activeRate ?? 0n));
  const activeRateRank = $derived(record?.rank.activeRate);
  const level = $derived(record?.level);
  const point = $derived(record?.point);
  const levelRank = $derived(record?.rank.level);
  const maxActiveRateRank = $derived(record?.maxRateRank ?? undefined);
  const maxActiveRate = $derived(record?.maxRate ?? undefined);
  const maxLevelRank = $derived(record?.maxlevelRank ?? undefined);

  const reviewStars = $derived(data.reviews.map(({ star }) => star));
  const reviews = $derived(
    data.reviews.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()),
  );
</script>

<Meta title={name} />

<GuildBlock
  {guildId}
  {name}
  {description}
  {nsfw}
  {boostCount}
  {tags}
  {iconUrl}
  {activeRate}
  {activeRateRank}
  {level}
  {point}
  {levelRank}
  {maxActiveRateRank}
  {maxActiveRate}
  {maxLevelRank}
/>
<Evaluation reviews={reviewStars} />
<Block>
  <BlockTitle title="レビュー" />
  <div class="reviews">
    {#if reviews.length}
      {#each reviews as review (review.userId)}
        <Review {...review} />
      {/each}
    {:else}
      <p>レビューが見つかりませんでした。</p>
    {/if}
  </div>
</Block>

<style>
  .reviews {
    overflow: hidden;
  }
</style>
