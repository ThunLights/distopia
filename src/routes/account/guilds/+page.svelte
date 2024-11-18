<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import { onMount } from "svelte";
    import { token2data } from "$lib/auth.svelte";

    import type { ResponseContent } from "$lib/api/auth";
    import type { GuildsUser } from "$lib/server/discord";
    import type { Response } from "$lib/api/guilds";

    let loginData = $state<ResponseContent | null>(null);
    let guilds = $state<GuildsUser[] | null>(null);
    let loading = $state(true);

    onMount(async () => {
        loginData = await token2data();
        if (!loginData) {
            return location.href = "/";
        }
        const response = await fetch(`/api/guilds`, {
            method: "POST",
            headers: {
                "Authorization": loginData.token,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
        })
        if (response.ok) {
            const data: Response = await response.json();
            if (Array.isArray(data.content)) {
                guilds = data.content;
            }
        }
        loading = false;
    })
</script>

<Meta/>

<Header userData={loginData}/>
<main>
    <div class="contents">
        {#if guilds}
            <div class="guilds">
                {#each guilds as guild}
                    <div class="guild">
                        <p class="name">{guild.name}</p>
                    </div>
                {/each}
            </div>
        {:else if !loading}
            <p>上手く読み込み出来ませんでした。</p>
        {/if}
    </div>
</main>
<Footer fixed={true}/>

<style>
    p {
        color: white;
    }
    .guilds {
        width: 90%;
        margin: 20px auto;
    }
    .guild {
        margin-top: 10px;
    }
    .guild .name {
        font-size: 20px;
    }
</style>
