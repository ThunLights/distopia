<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

	import { onMount } from "svelte";
	import { token2data } from "$lib/auth.svelte";
	import { getCategory } from "$lib/category.svelte";
//	import { getPublicGuild, GuildsApiError } from "$lib/guilds.svelte";

    import type { PageData } from "./$types";
	import type { Response } from "$routes/api/guilds/public/[id]/+server";

	type Auth = {
		token: string;
		id: string;
		username: string;
		email: string | null;
		avatar: string | null;
	}

    const { data }: { data: PageData } = $props();
	const { guildId, content } = data;
	const guild = $state<Response | null>(content);
	const title = $state(content ? `「${content.name}」のページ` : `ID:${guildId} は見つかりませんでした。`);
	const reviews = $state([]);

    let loginData = $state<Auth | null>(data.auth);

	onMount(async () => {
		loginData = await token2data();
	})
</script>

<Meta
	title={title}
	description={guild ? guild.description.replaceAll("\n", "") : undefined}
/>

<Header userData={loginData}/>
<main>
	{#if guild}
		<div class="contents">
			<div class="context">
				<div class="guild-info">
					<div>
						<img class="icon" src="{guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"}" alt="">
					</div>
					<div>
						<p class="guild-name">{guild.name}</p>
						<p>ブースト: {guild.boost}</p>
						<p>カテゴリ: {getCategory(guild.category)}</p>
					</div>
				</div>
				<div>
					<p class="name">タグ一覧</p>
					<div class="tags">
						{#each guild.tags as tag}
							<a class="tag" href="/search?tag={tag}">
								<div class="content">
									<p>{tag}</p>
								</div>
							</a>
						{/each}
					</div>
				</div>
				<div>
					<p class="name">説明</p>
					<div>
						{#each guild.description.split("\n") as line}
							<p>{line}</p>
						{/each}
					</div>
				</div>
				<div>
					<p class="name">ランキング</p>
					<div>
						<p>現在: 未実装</p>
						<p>最高: 未実装</p>
					</div>
				</div>
				<div>
					<p class="name">詳細</p>
					<div>
						<div>
							<p>レベル: 未実装</p>
							<p>アクティブレート: 未実装</p>
						</div>
					</div>
				</div>
				<div>
					<p class="name">イベントカレンダー</p>
					<div>
						<p>イベントが登録されていません</p>
					</div>
				</div>
				<div>
					<button class="join-button">「{guild.name}」に参加</button>
				</div>
			</div>
		</div>
		<div class="contents">
			<div class="context">
				<p class="name">評価: 未実装</p>
				<div>
				</div>
			</div>
		</div>
		<div class="contents">
			<div class="context">
				<p class="name">レビュー</p>
				<div>
					{#if reviews.length}
						<div></div>
					{:else}
						<p>「{guild.name}」はまだレビューされていません</p>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="content">
			<div class="result">
				<p class="not-found">サーバーが見つかりませんでした。</p>
			</div>
		</div>
	{/if}
</main>
<Footer/>

<style>
	.join-button {
		margin-top: 15px;
		cursor: pointer;
		font-size: 15px;
		font-weight: 800;
		text-align: center;
		padding: 10px;
		width: 100%;
        color: rgb(52, 198, 52);
        background-color: rgb(59, 59, 59);
        border: 1px solid rgb(85, 85, 85);
	}
	.join-button:active {
        border: 1px solid rgb(49, 49, 49);
        background-color: rgb(85, 85, 85);
    }
	.tags {
		margin-top: 7px;
		width: 100%;
	}
	.tag {
		border-radius: 25px;
		background-color: rgb(66, 66, 66);
		display: inline-block;
		margin-right: 10px;
	}
	.tag p {
		display: inline-block;
		color: white;
	}
	.tag .content {
		margin: 3px 5px;
	}
	.name {
		font-size: 22px;
		font-weight: 700;
		margin-top: 10px;
	}
	.icon {
		margin-right: 10px;
		border-radius: 50%;
	}
	.context {
		overflow: hidden;
		margin: 10px 20px;
	}
    .contents {
        overflow: hidden;
        display: block;
        background-color: rgb(37, 36, 41);
        border-radius: 10px;
        width: 90%;
        margin: 20px auto;
    }
	.guild-name {
		font-size: 28px;
		font-weight: 700;
	}
	.guild-info>div {
		display: inline-block;
	}
	.guild-info {
		margin-top: 15px;
	}
	a, p {
		font-size: 15px;
		text-decoration: none;
		color: white;
	}
</style>
