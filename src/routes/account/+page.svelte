<script lang="ts">
    import { onMount } from "svelte";

    import { token2data } from "$lib/auth.svelte";

    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import type { ResponseContent } from "$lib/api/auth/index";

    let loginData = $state<ResponseContent | null>(null);
    let loading = $state(true);
    let title = $state("ログインしてください");

    onMount(async () => {
        loginData = await token2data();
        if (!loginData) {
            return location.href = "/";
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
    {#if loginData}
        <div class="contents">
            <div>
                <p class="title">ユーザー詳細</p>
                <div>
                    <p>{loginData.id}</p>
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
</main>
<Footer/>

<style>
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
