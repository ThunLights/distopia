<script lang="ts">
  import Footer from "$lib/components/Footer.svelte";
  import Header from "$lib/components/Header.svelte";
  import "../app.css";
  import { SvelteToast } from "@zerodevx/svelte-toast";

  let { children, data } = $props();
</script>

<SvelteToast />
<svelte:head>
  <script>
    // partytown.js defaults to its debug (unminified) build unless `debug` is explicitly false --
    // "%partytown.debug%" (quoted so this stays valid, parseable JS) is replaced with the real
    // boolean literal in hooks.server.ts, so production doesn't ship the debug build to visitors.
    window.partytown = { forward: ["dataLayer.push"], debug: "%partytown.debug%" };
  </script>
  <script src="/~partytown/partytown.js?v=%partytown.version%"></script>
  <script
    async
    fetchpriority="low"
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9010324670720699"
    crossorigin="anonymous"
  ></script>
  <script
    type="text/partytown"
    src="https://www.googletagmanager.com/gtag/js?id=G-XZSXC8MQPZ"
  ></script>
  <script type="text/partytown">
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      dataLayer.push(arguments);
    }
    gtag("js", new Date());

    gtag("config", "G-XZSXC8MQPZ");
  </script>
</svelte:head>

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
