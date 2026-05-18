<script lang="ts">
  /* eslint svelte/no-navigation-without-resolve: "off" */
  import type { ResolvedPathname } from "$app/types";

  type Props = {
    tags: {
      label: string;
      link: ResolvedPathname;
    }[];
  };

  const { tags }: Props = $props();
</script>

<div class="tags">
  {#each tags as tag (tag)}
    <div class="tag">
      <p><a href={tag.link}>{tag.label}</a></p>
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
  a {
    color: white;
    text-decoration: none;
  }
</style>
