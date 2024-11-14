<script lang="ts">
    import { onMount } from "svelte";

    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import type { PageData } from "./+page.server"

    export const data: PageData = $props();

    const result = $state(data.content ? "認証に成功しました。" : "認証に失敗しました。");
    const title = $state(result);
    const description = $state(result ? `${result}数秒後にリダイレクトされます。` : `${result}再度試してみてください。`);

    onMount(async () => {});
</script>

<Meta
    title={title}
    description={description}
/>

<Header
    loginPanel={false}
/>
<main>
    <p></p>
</main>
<Footer fixed={true}/>

<style></style>
