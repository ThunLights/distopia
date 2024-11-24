<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import { onMount } from "svelte";

    import type { PageData } from "./$types";

    const { data }: { data: PageData } = $props();
    let loginData = $state(data.auth);

    onMount(async () => {
        if (!loginData) {
            return location.href = "/";
        }
    })
</script>

<Meta/>

<Header userData={loginData}/>
<main>
</main>
<Footer/>

<style></style>
