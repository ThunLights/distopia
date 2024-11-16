<script lang="ts">
    import { onMount } from "svelte";

    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import type { PageData } from "./$types"

    const { data } = $props<{ data: PageData }>();

    const { content } = $state(data);
    const result = $state(content ? "認証に成功しました。" : "認証に失敗しました。");
    const title = $state(result);
    const description = $state(result ? `${result}数秒後にリダイレクトされます。` : `${result}再度試してみてください。`);

    onMount(async () => {
        if (content) {
            sessionStorage.setItem("token", content.token);
            setTimeout(async () => {
                location.href = "/"
            }, 3000);
        }
    });
</script>

<Meta
    title={title}
    description={description}
/>

<Header userData={content} loginBlock={false}/>
<main>
    <div class="contents">
        <p class="title">{result}</p>
        {#if content}
            <p>数秒後にリダイレクトされます。</p>
        {:else}
            <p>Discordの設定などを再度確認してください。</p>
        {/if}
    </div>
</main>
<Footer fixed={true}/>

<style>
    p {
        padding: 10px 0;
        color: white;
    }
    .contents {
        overflow: hidden;
        display: block;
        background-color: rgb(37, 36, 41);
        text-align: center;
        border-radius: 20px;
        width: 90%;
        margin: 20px auto;
    }
    .title {
        padding-top: 15px;
        font-size: 30px;
    }
</style>
