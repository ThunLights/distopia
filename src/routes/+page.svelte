<script lang="ts">
    import { onMount } from "svelte";
    import { getMeridiem } from "$lib/time";

    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    let bgUrl = $state("");

    onMount(async () => {
        bgUrl = getMeridiem(navigator.language) === "AM" ? "/am.webp" : "/pm.webp";
        document.body.style.setProperty("--body-background-color", "#313338")
    })
</script>

<Meta></Meta>

<Header></Header>
<main style="--bg-url: url({bgUrl});">
    <div class="entrance-img">
        <img src="{bgUrl}" alt="test">
    </div>
</main>
<Footer fixed={true}></Footer>

<style>
    main {
        width: 100%;
        overflow: hidden;
    }
    .entrance-img img {
        width: 100%;
        height: auto;
    }
</style>
