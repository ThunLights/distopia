<script lang="ts">
  import PrimaryButton from "$lib/components/Button/PrimaryButton.svelte";
  import { CHARACTER_LIMIT } from "app-core/constant";

  type Props = {
    searchWord: string;
  };

  let { searchWord }: Props = $props();

  async function inputSearchCommand(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      await search();
    }
  }

  async function search() {
    location.href = `/search?w=${encodeURIComponent(searchWord)}`;
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
    bind:value={searchWord}
  />
  <PrimaryButton onclick={search}>検索</PrimaryButton>
</div>

<style>
  .search-input {
    width: 60%;
    font-size: 15px;
    border-radius: 25px;
    padding: 4px 8px;
  }
</style>
