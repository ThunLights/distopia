<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import { onMount } from "svelte";
  import "../app.css";

  let { children, data } = $props();

  onMount(async () => {});
</script>

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
