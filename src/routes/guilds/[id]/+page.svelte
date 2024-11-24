<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import type { PageData } from "./$types";

    const { data }: { data: PageData } = $props();
    const { guild, tags } = $state(data);
    const title = $state(guild ? `${guild.name} / Discordサーバー` : "サーバーがありませんでした。");
    const loginData = $state(data.auth);
</script>

<Meta/>

<Header title={title} userData={loginData}/>
<main>
    <div class="contents">
        {#if guild}
            <div>
                <div class="guild-info">
                    <div>
                        <img class="icon" src="{guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"}" alt="">
                    </div>
                    <div>
                        <p class="guild-name">{guild.name}</p>
                        <p class="guild-id">ID: {guild.guildId}</p>
                        <p class="guild-category">カテゴリ: {guild.category}</p>
                        <div class="guild-tags">
                            {#each tags as tag}
                                <a href="/search?tag={tag}">
                                    <div class="guild-tag">
                                        <p>{tag}</p>
                                    </div>
                                </a>
                            {/each}
                        </div>
                        <div class="description">
                            {#each guild.description.split("\n") as line}
                                <p>{line}</p>
                            {/each}
                        </div>
                    </div>
                </div>
                <div>
                    <button>「{guild.name}」に参加</button>
                </div>
            </div>
        {:else}
            <div class="result">
                <p class="not-found">サーバーが見つかりませんでした。</p>
            </div>
        {/if}
    </div>
</main>
<Footer/>

<style></style>
