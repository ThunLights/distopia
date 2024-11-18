<script lang="ts">
    import { onMount } from "svelte";
    import { getMeridiem } from "$lib/time.svelte";
    import { token2data } from "$lib/auth.svelte";

    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import type { ResponseContent } from "$lib/api/auth/index";

    type LoginData = ResponseContent | null;

    let bgUrl = $state("");
    let loginData: LoginData = $state(null);

    onMount(async () => {
        bgUrl = getMeridiem(navigator.language) === "AM" ? "/am.webp" : "/pm.webp";
        loginData = await token2data();
    })
</script>

<Meta></Meta>

<Header userData={loginData}/>
<main style="--bg-url: url({bgUrl});">
    <div class="entrance-img">
        <img src="{bgUrl}" alt="loading">
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
