<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Footer from "$lib/footer.svelte";

    const title = "ページが見つかりませんでした";
    const description = [
        "ページが見つかりませんでした。",
        "URLのタイプミスなどはありませんか？",
        "再度確認してみてください。"
    ].join("");
</script>

<Meta
    title={title}
    description={description}
/>

<main>
    <div class="contents">
        <p class="contents-title">404</p>
        <p>ページが見つかりませんでした</p>
    </div>
</main>
<Footer fixed={true}></Footer>

<style>
    main {
        width: 100%;
    }
    p {
        color: rgb(153, 153, 153);
    }
    .contents {
        text-align: center;
    }
    .contents-title {
        font-size: 60px;
    }
</style>
