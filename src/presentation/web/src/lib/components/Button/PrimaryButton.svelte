<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    children?: Snippet;
    onclick?: () => void | Promise<void>;
    disabled?: boolean;
  };

  const { children, onclick, disabled }: Props = $props();
</script>

<button {onclick} {disabled}>
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  button {
    cursor: pointer;
    border-radius: 25px;
    color: white;
    background-color: rgb(49, 49, 49);
    opacity: 0.8;
    padding: 3px 6px;
    border: 1px solid rgb(85, 85, 85);
  }
  button:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
  button:active {
    border: 1px solid rgb(49, 49, 49);
    background-color: rgb(85, 85, 85);
  }
</style>
