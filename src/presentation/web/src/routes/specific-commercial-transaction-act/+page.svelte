<script lang="ts">
  import Block from "#lib/components/Block.svelte";
  import MarkDown from "#lib/components/MarkDown.svelte";
  import Meta from "#lib/components/Meta.svelte";
  import SpecificCommercialTransactionAct from "#lib/contents/SpecificCommercialTransactionAct.md?raw";

  const { data } = $props();
  const content = $derived(
    SpecificCommercialTransactionAct.replaceAll("SELLER_NAME", data.sellerName),
  );
</script>

<Meta title="特定商取引法に基づく表記" description="Distopiaの特定商取引法に基づく表記です。" />

<Block>
  <h1>特定商取引法に基づく表記</h1>
  <MarkDown {content} />
</Block>
