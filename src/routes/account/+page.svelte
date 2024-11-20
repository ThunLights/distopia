<script lang="ts">
    import { onMount } from "svelte";

    import { getGuilds } from "$lib/guilds.svelte";
    import { token2data } from "$lib/auth.svelte";

    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import type { ResponseContent } from "$lib/types/auth/index";
    import type { GuildsUser } from "$lib/server/discord";

    let loginData = $state<ResponseContent | null>(null);
    let loading = $state(true);
    let guilds = $state<GuildsUser[]>([]);
    let registerCount = $state(0);
    let guildsCount = $derived(guilds.filter(guild => guild.owner).length);
    let title = $state("ログインしてください");

    onMount(async () => {
        loginData = await token2data();
        if (!loginData) {
            return location.href = "/";
        }
        const servers = await getGuilds(loginData.token);
        if (Array.isArray(servers)) {
            guilds = servers;
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
                        <p>登録サーバー: {registerCount}</p>
                        <p>登録可能サーバー: {guildsCount}</p>
                    </div>
                </div>
            </div>
            <div class="contents">
                <div>
                    <p class="title">サーバー</p>
                    <div>
                        <p>登録済み</p>
                    </div>
                    <div>
                        <p>新規登録は<a href="/guilds/new">こちら</a></p>
                    </div>
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
    .profile-contents {
        margin: 15px 10px;
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
    .contents {
        overflow: hidden;
        display: block;
        background-color: rgb(37, 36, 41);
        border-radius: 20px;
        width: 90%;
        margin: 20px auto;
    }
    .contents>div {
        padding: 5px 10px;
    }
    p {
        color: white;
    }
</style>
