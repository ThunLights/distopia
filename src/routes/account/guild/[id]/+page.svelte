<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import { onMount } from "svelte";
	import { getPublicGuild, GuildsApiError } from "$lib/guilds.svelte";
	import { CATEGORIES } from "$lib/category.svelte";

    import type { PageData } from "./$types";
	import type { Response } from "$routes/api/guilds/public/[id]/+server";

    const { data }: { data: PageData } = $props();
	const { guildId } = data;
    const loginData = $state(data.auth);
	let guild = $state<Response | null>(null);
	let category = $derived<string | null>(getCategory(guild ? guild.category : null));

	function getCategory(category: string | null) {
		const base = CATEGORIES.find(value => value.id === category) ?? null;
		return base ? base.name : null;
	}

    onMount(async () => {
		if (!loginData) {
			return location.href = "/account";
		}
		const response = await getPublicGuild(loginData.token, guildId);
		if (response instanceof GuildsApiError) {
			return location.href = "/account";
		}
		guild = response;
	})
</script>

<Meta/>

<Header userData={loginData}/>
<main>
	{#if guild}
		<div class="guild">
			<div class="contents">
				<div class="info">
					<div>
						<img class="icon" src="{guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"}" alt="">
					</div>
					<div>
						<p class="name">{guild.name}</p>
						<div class="informations">
							<p>ID: {guild.guildId}</p>
							<p>INVITE: {guild.invite}</p>
						</div>
					</div>
				</div>
				<div class="page">
					<div>
						<p class="title">現在の設定</p>
					</div>
					<div class="content">
						<p>タグ</p>
						<div class="content tags">
							{@render generateTagsElement(guild.tags)}
						</div>
					</div>
					<div class="content">
						<p>カテゴリ</p>
						<div class="content">
							<p>{category ?? "ロード中です。"}</p>
						</div>
					</div>
					<div class="content">
						<p>説明欄</p>
						<div class="content">
							{@render description(guild.description)}
						</div>
					</div>
					<div class="content">
						<p>NSFW</p>
						<div class="content">
							<p>{guild.nsfw ? "有効" : "無効"}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<p>ロード中です。</p>
	{/if}
</main>
<Footer/>

{#snippet generateTagsElement(tags: string[])}
	{#each tags as tag}
		<p class="tag">{tag}</p>
	{/each}
{/snippet}

{#snippet description(content: string)}
	{#each content.split("\n") as line}
		<p>{line}</p>
	{/each}
{/snippet}

<style>
	.tag {
		padding: 1px 3px;
		border-radius: 25px;
		background-color: rgb(59, 59, 59);
		margin-right: 5px;
		display: inline-block;
	}
	.guild .info div {
		display: inline-block;
	}
    .guild .icon {
        height: 90px;
        border-radius: 50%;
    }
	.guild .name {
		font-weight: 700;
        font-size: 30px;
	}
	.guild .informations p {
		font-size: 10px;
	}
	.guild {
        overflow: hidden;
        display: block;
        background-color: rgb(37, 36, 41);
        border-radius: 20px;
        width: 90%;
        margin: 20px auto;
	}
	.contents>div>.content>p {
		font-size: 18px;
		font-weight: 600;
		margin-top: 4px;
	}
	.contents>div .title {
		font-weight: 700;
		font-size: 24px;
		margin-top: 10px;
	}
	.contents>div {
		margin: 10px 0 15px 0;
		overflow: hidden;
	}
	.contents {
		margin: 10px 20px;
		overflow: hidden;
	}
	p {
		color: white;
	}
</style>
