<script lang="ts">
  import "$lib/assets/a-tag.css";
  import "$lib/assets/md.css";
  import About from "$lib/components/About.svelte";
  import Footer from "$lib/components/Footer.svelte";
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
  <div class="contents">
    <About />
  </div>
</main>
<Footer />

<style>
  .contents {
    margin: 20px auto;
    width: 90%;
  }
</style>
