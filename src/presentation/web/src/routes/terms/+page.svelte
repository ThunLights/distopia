<script lang="ts">
  import Block from "$lib/components/Block.svelte";
  import Footer from "$lib/components/Footer.svelte";
  import Terms from "$lib/components/Main/Terms.svelte";
  import Meta from "$lib/components/Meta.svelte";
</script>

<Meta
  title="利用規約"
  description={["Distopiaの利用規約です。", "サービス利用時に一度ご確認ください。"].join("")}
/>

<main>
  <Block>
    <Terms />
  </Block>
</main>
<Footer />
