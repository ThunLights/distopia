<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children?: Snippet;
  };

  const { children }: Props = $props();
</script>

<div class="components">
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .components {
    margin: 20px auto;
    display: grid;
    grid-template-columns: 32% 32% 32%;
    grid-template-rows: auto;
  }
  @media (max-width: 1100px) {
    .components {
      grid-template-columns: 48% 48%;
    }
  }
  @media (max-width: 800px) {
    .components {
      grid-template-columns: 98%;
    }
  }
</style>
