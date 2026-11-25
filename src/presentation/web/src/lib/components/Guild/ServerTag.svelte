<script lang="ts">
  type Props = {
    tag: string;
    badgeUrl?: string | null;
  };

  const { tag, badgeUrl }: Props = $props();
</script>

<span class="server-tag">
  {#if badgeUrl}
    <img src={badgeUrl} alt="" width="14" height="14" />
  {/if}
  {tag}
</span>

<style>
  .server-tag {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 1px 6px;
    border-radius: 6px;
    background-color: rgb(66, 66, 66);
    color: white;
    font-size: 12px;
    font-weight: 700;
    vertical-align: middle;
  }
</style>
