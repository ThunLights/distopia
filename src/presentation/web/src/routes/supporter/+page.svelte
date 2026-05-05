<script lang="ts">
  import Block from "$lib/components/Block.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import Supporter from "$lib/components/Supporter/Content.svelte";
  import Explain from "$lib/components/Supporter/Explain.svelte";
  import Title from "$lib/components/Title.svelte";
  import { supporters } from "$lib/shared/constant";
</script>

<Meta
  title="Supporter"
  description={["サポートサーバーに関する説明です。", "支援団体等が記載されています。"].join("")}
/>

<Block>
  <Title content="現在の支援団体一覧" />
  {#each supporters as supporter (supporter)}
    <Supporter {supporter} />
  {/each}
</Block>
<Block>
  <Explain />
</Block>
