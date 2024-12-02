<script lang="ts">
    import { onMount } from "svelte";
//	import { headerStore } from "$lib/stores";

    import Meta from "$lib/meta.svelte";
    import Footer from "$lib/footer.svelte";

    const { data } = $props();

    const { content } = $state(data);
    const result = $state(content ? "認証に成功しました。" : "認証に失敗しました。");
    const title = $state(result);
    const description = $state(result ? `${result}数秒後にリダイレクトされます。` : `${result}再度試してみてください。`);

    onMount(() => {
//		headerStore.set({
//			loginBlock: false,
//		});
        if (content) {
            localStorage.setItem("token", content.token);
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
