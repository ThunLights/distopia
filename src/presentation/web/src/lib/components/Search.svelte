<script lang="ts">
  import PrimaryButton from "$lib/components/Button/PrimaryButton.svelte";

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
