<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import "../app.css";
  import { SvelteToast } from "@zerodevx/svelte-toast";

  let { children, data } = $props();
</script>

<SvelteToast />

<Header userData={data.user} />
<main>
  {@render children()}
</main>
<Footer />

<style>
  main {
    min-height: 90vh;
  }
</style>
