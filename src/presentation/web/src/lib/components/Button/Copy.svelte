<script lang="ts">
  import type { Snippet } from "svelte";

  type Props = {
    copyTxt: string;
    children?: Snippet;
  };

  const { copyTxt, children }: Props = $props();

  function copy(txt: string) {
    return async () => {
      await navigator.clipboard.writeText(txt);
      //			Toast.success("コピーしました。");
    };
  }
</script>

<button onclick={copy(copyTxt)}>
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  button {
    padding: 0;
    border: none;
    outline: none;
    font: inherit;
    color: inherit;
    background: none;
  }
</style>
