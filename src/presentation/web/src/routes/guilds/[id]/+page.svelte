<script lang="ts">
  import Block from "$lib/components/Block.svelte";
  import BlockTitle from "$lib/components/Guild/BlockTitle.svelte";
  import Evaluation from "$lib/components/Guild/Evaluation.svelte";
  import GuildBlock from "$lib/components/Guild/GuildBlock.svelte";
  import Review from "$lib/components/Guild/Review.svelte";
  import Meta from "$lib/components/Meta.svelte";

  const { data } = $props();
  const { guild, user } = $derived(data);
  const {
    guildId,
    name,
    nsfw,
    description,
    tags,
    invite,
    boostCount,
    iconUrl,
    activeRate,
    activeRateRank,
    level,
    point,
    levelRank,
    maxLevelRank,
    maxActiveRate,
    maxActiveRateRank,
  } = $derived(guild);

  const reviewStars = $derived(data.reviews.map(({ star }) => star));
  const { reviews } = $derived(data);
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
  {user}
  {invite}
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
