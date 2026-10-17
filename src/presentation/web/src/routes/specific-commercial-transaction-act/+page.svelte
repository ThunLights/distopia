<script lang="ts">
  import { env } from "$env/dynamic/public";
  import Block from "$lib/components/Block.svelte";
  import MarkDown from "$lib/components/MarkDown.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import SpecificCommercialTransactionAct from "$lib/contents/SpecificCommercialTransactionAct.md?raw";

  const content = SpecificCommercialTransactionAct.replaceAll(
    "SELLER_NAME",
    env.PUBLIC_SELLER_NAME ?? "",
  );
</script>

<Meta
  title="特定商取引法に基づく表記"
  description="Distopiaの特定商取引法に基づく表記です。"
/>

<Block>
  <h1>特定商取引法に基づく表記</h1>
  <MarkDown {content} />
</Block>
