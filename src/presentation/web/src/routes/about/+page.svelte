<script lang="ts">
  import "$lib/assets/a-tag.css";
  import "$lib/assets/md.css";
  import Block from "$lib/components/Block.svelte";
  import About from "$lib/components/Main/About.svelte";
  import Meta from "$lib/components/Meta.svelte";
</script>

<Meta
  title="Distopiaについて / Distopia.top"
  description={[
    "Distopiaの大まかな解説です。",
    "細かい技術等の質問は公式Discordサーバーにてお願いします。",
  ].join("")}
/>

<main>
  <Block>
    <About />
  </Block>
</main>
