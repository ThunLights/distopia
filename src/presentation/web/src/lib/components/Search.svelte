<script lang="ts">
  import PrimaryButton from "$lib/components/Button/PrimaryButton.svelte";
  import type { MaybePromise } from "$lib/shared/types/Promise";
  import { CHARACTER_LIMIT } from "app-core/constant";

  type Props = {
    searchWord: string;
    func: (term: string) => () => MaybePromise<void>;
  };

  let { searchWord, func }: Props = $props();
  let term = $derived(searchWord);

  async function inputSearchCommand(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      await func(term)();
    }
  }
</script>

<div>
  <input
    class="search-input"
    type="text"
    spellcheck="false"
    autocomplete="off"
    maxlength={CHARACTER_LIMIT.searchTerm}
    onkeyup={inputSearchCommand}
    bind:value={term}
  />
  <PrimaryButton onclick={func(term)}>検索</PrimaryButton>
</div>

<style>
  .search-input {
    width: 60%;
    font-size: 15px;
    border-radius: 25px;
    padding: 4px 8px;
  }
</style>
