<script lang="ts">
  import { deleteAuth, setAuth } from "$lib/client/auth";
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import "../app.css";
  import { SvelteToast } from "@zerodevx/svelte-toast";
  import { onMount } from "svelte";

  let { children, data } = $props();

  onMount(async () => {
    if (data.user) {
      await setAuth(data.user.token);
    } else {
      await deleteAuth();
    }
  });
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
