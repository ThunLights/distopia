<script lang="ts">
  type Props = {
    tags: string[];
  };

  const { tags }: Props = $props();
</script>

<div class="tags">
  {#each tags as tag (tag)}
    <div class="tag">
      <p>{tag}</p>
    </div>
  {/each}
</div>

<style>
  .tags {
    margin: 7px auto;
    width: 100%;
  }
  .tags > .tag {
    border-radius: 25px;
    background-color: rgb(66, 66, 66);
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 6px;
  }
  .tags > .tag > p {
    font-size: 12px;
    margin: 3px 5px;
  }
</style>
