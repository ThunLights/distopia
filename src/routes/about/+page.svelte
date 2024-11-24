<script lang="ts">
    import "$routes/aTag.css";

    import { siteAbout } from "$lib/constants.svelte";

    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

	import type { PageData } from "./$types";

    const { data }: { data: PageData } = $props();
    const loginData = $state(data.auth);
</script>

<Meta title="Distopiaについて / Distopia.top"/>

<Header userData={loginData}/>
<main>
    <div class="contents">
        {#each siteAbout as about}
            <div class="section">
                <p class="title">{about.title}</p>
                <div class="section-contents">
                    {#each about.description as description}
                        <p>{@html description}</p>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</main>
<Footer/>

<style>
    .contents {
        margin: 20px auto;
        width: 90%;
    }
    .contents p {
        color: rgb(207, 207, 207);
    }
    .contents .title {
        padding: 10px 0;
        margin-bottom: 14px;
        font-size: 25px;
    }
    .section {
        margin: 15px 0;
    }
    .title {
        position: relative;
        margin-bottom: 0.2rem;
        padding: 1rem 0;
        border-bottom: 5px solid;
        color: #696969;
        font-size: 26px;
        font-weight: bold;
    }
    .title:before {
        position: absolute;
        bottom: -0.6rem;
        left: 0rem;
        right: 0rem;
        border-bottom: 1px solid;
        content: "";
    }
</style>
