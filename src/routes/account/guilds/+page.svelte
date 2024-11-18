<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import { onMount } from "svelte";
    import { token2data } from "$lib/auth.svelte";
    import { getGuilds } from "$lib/guilds.svelte";

    import type { ResponseContent } from "$lib/api/auth";
    import type { GuildsUser } from "$lib/server/discord";

    let loginData = $state<ResponseContent | null>(null);
    let guilds = $state<GuildsUser[] | null>(null);
    let loading = $state(true);

    onMount(async () => {
        loginData = await token2data();
        if (!loginData) {
            return location.href = "/";
        }
        const servers = await getGuilds(loginData.token);
        if (Array.isArray(servers)) {
            guilds = servers.filter(guild => guild.owner);
        }
        loading = false;
    })
</script>

<Meta/>

<Header userData={loginData}/>
<main>
    <div class="contents">
        <div class="guilds-public"></div>
        {#if guilds}
            {#if guilds.length}
                <div class="guilds">
                    {#each guilds as guild}
                        <div class="guild">
                            <div>
                                <img class="icon" src="{guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp` : "/discord.webp"}" alt="">
                            </div>
                            <div>
                                <p class="name">{guild.name}</p>
                                <div class="informations">
                                    <p>ID: {guild.id}</p>
                                    <p>ユーザー数: {guild.approximate_member_count} (アクティブ: {guild.approximate_presence_count})</p>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <p>掲載可能なサーバーが見つかりませんでした。</p>
                <p>サーバーを掲載するにはサーバーの所有権を持っているアカウントである必要があります。</p>
            {/if}
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
