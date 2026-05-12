<script lang="ts">
  type Props = {
    title: string;
  };

  const { title }: Props = $props();
</script>

<p class="block-title">{title}</p>

<style>
  .block-title {
    font-size: 22px;
    font-weight: 700;
    margin-top: 10px;
  }
</style>
