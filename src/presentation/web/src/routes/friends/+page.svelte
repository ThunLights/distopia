<script lang="ts">
  import Card from "$lib/components/Friend/Card.svelte";
  import CardLayout from "$lib/components/Layout/CardLayout.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import { onMount } from "svelte";

  const { data } = $props();
  const { friends } = $derived(data);

  onMount(async () => {});
</script>

<Meta
  title="フレンド募集"
  description={["Distopiaを通してフレンド募集できます。", "気軽にお使いください。"].join("")}
/>

<CardLayout>
  {#each friends as friend (friend.userId)}
    <Card {friend} />
  {/each}
</CardLayout>
