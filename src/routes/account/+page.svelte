<script lang="ts">
    import { onMount } from "svelte";

    import { getGuilds, getPublicGuilds } from "$lib/guilds.svelte";
    import { token2data } from "$lib/auth.svelte";

    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import type { ResponseContent } from "$lib/types/auth/index";
    import type { GuildsUser } from "$lib/server/discord";
    import type { Guild } from "$lib/server/Database/Guild/Guild";

    let loginData = $state<ResponseContent | null>(null);
    let loading = $state(true);
    let guilds = $state<GuildsUser[]>([]);
    let publicGuilds = $state<Guild[]>([]);
    let guildsCount = $derived(guilds.filter(guild => guild.owner).length);
    let publicGuildsCount = $derived(publicGuilds.length);
    let title = $state("ログインしてください");

    onMount(async () => {
        loginData = await token2data();
        if (!loginData) {
            return location.href = "/";
        }
        const servers = await getGuilds(loginData.token);
        const publicServers = await getPublicGuilds(loginData.token);
        if (Array.isArray(servers)) {
            guilds = servers;
        }
        if (Array.isArray(publicServers)) {
            publicGuilds = publicServers;
        }
        loading = false;
        title = `「${loginData.username}」の詳細情報`
    })
</script>

<Meta
    title={title}
/>

<Header userData={loginData}/>
<main>
    <div class="main-div">
        {#if loginData}
            <div class="profile">
                <div class="profile-contents">
                    {#if loginData.avatar}
                        <div class="profile-content">
                            <img class="icon" src="https://cdn.discordapp.com/avatars/{loginData.id}/{loginData.avatar}.webp" alt="">
                        </div>
                    {/if}
                    <div class="profile-content">
                        <p class="profile-title">「 {loginData.username} 」でログイン中</p>
                        <p>ID: {loginData.id}</p>
                        <p>登録サーバー: {publicGuildsCount}</p>
                        <p>登録可能サーバー: {guildsCount}</p>
                    </div>
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">アカウント操作</p>
                    <p class="not-found">現状コマンドがありません</p>
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">ランキング掲載サーバー</p>
                    <p class="not-found">ランキング上位のサーバーはありません</p>
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">登録済みイベント</p>
                    <p class="not-found">登録済みイベントはありません</p>
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">登録済みサーバー</p>
                    {#if publicGuilds.length}
                        <div></div>
                    {:else}
                        <p class="not-found">現在登録されているサーバーはありません</p>
                    {/if}
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">登録可能サーバー</p>
                    {#if guilds.length}
                        <div class="guilds">
                            {#each guilds.filter(value => value.owner) as guild}
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
                        <p class="not-found">登録可能サーバーがありません</p>
                    {/if}
                </div>
            </div>
        {:else if !loading}
            <div class="contents">
                <p>上手くデータが読み込まれませんでした</p>
                <p>再ロードしてください</p>
            </div>
        {/if}
    </div>
</main>
<Footer/>

<style>
    .guilds {
        width: 95%;
        margin: 20px auto;
    }
    .guild>div {
        display: inline-block;
    }
    .guild {
        margin-top: 10px;
    }
    .guild .icon {
        height: 50px;
        border-radius: 50%;
    }
    .guild .name {
        font-size: 14px;
    }
    .guild .informations p {
        font-size: 8px;
    }
    .profile-contents {
        margin: 25px 10px;
    }
    .profile-content {
        display: inline-block;
        margin-right: 12px;
    }
    .profile-title {
        font-size: 18px;
        margin-bottom: 5px;
    }
    .profile {
        overflow: hidden;
        background-color: rgb(40, 40, 40)
    }
    .profile .icon {
        border-radius: 50%;
    }
    .contents .not-found {
        font-size: 15px;
    }
    .contents .title {
        font-size: 20px;
        padding: 5px 3px;
        border-bottom: solid 1px gray;
        margin-bottom: 10px;
    }
    .contents {
        overflow: hidden;
        display: block;
        background-color: rgb(37, 36, 41);
        border-radius: 10px;
        width: 90%;
        margin: 20px auto;
    }
    .contents>div {
        padding: 5px 10px;
    }
    .main-div {
        min-height: 90vh;
    }
    p {
        color: white;
    }
</style>
