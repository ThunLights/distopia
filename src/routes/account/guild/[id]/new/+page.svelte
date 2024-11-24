<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import { onMount } from "svelte";
    import { getGuilds, getPublicGuilds } from "$lib/guilds.svelte";

    import type { PageData } from "./$types";

    const { data }: { data: PageData } = $props();
    const loginData = $state(data.auth);
    let title = $state("Loading...");

    onMount(async () => {
        if (!loginData) {
            return location.href = "/";
        }
        const servers = await getGuilds(loginData.token);
        const publicServers = await getPublicGuilds(loginData.token);
    })
</script>

<Meta/>

<Header title={title}/>
<main>
</main>
<Footer/>

<style></style>
