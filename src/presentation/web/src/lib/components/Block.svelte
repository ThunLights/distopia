<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children?: Snippet;
  };
  const { children }: Props = $props();
</script>

<div class="content">
  <div class="main">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .main {
    overflow: hidden;
    margin: 20px;
  }
  .content {
    overflow: hidden;
    display: block;
    background-color: rgb(37, 36, 41);
    border-radius: 10px;
    width: 90%;
    margin: 20px auto;
  }
</style>
