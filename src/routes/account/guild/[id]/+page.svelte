<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import Footer from "$lib/components/footer.svelte";

	import { onMount } from "svelte";
	import { getPublicGuild, GuildsApiError } from "$lib/client/guilds";
	import { CATEGORIES } from "$lib/category";
	import { redirectUrl } from "$lib/redirect.svelte";

	import type { PageData } from "./$types";
	import type { Response } from "$routes/api/guilds/public/[id]/+server";

	const { data }: { data: PageData } = $props();
	const { guildId } = data;
	const loginData = $state(data.auth);
	let guild = $state<Response | null>(null);
	let title = $derived(guild ? `「${guild.name}」の詳細情報` : "ロード中です。");
	let category = $derived<string | null>(getCategory(guild ? guild.category : null));

	function getCategory(category: string | null) {
		const base = CATEGORIES.find((value) => value.id === category) ?? null;
		return base ? base.name : null;
	}

	onMount(async () => {
		if (!loginData) {
			return (location.href = "/account");
		}
		const response = await getPublicGuild(loginData.token, guildId);
		if (response instanceof GuildsApiError) {
			return (location.href = "/account");
		}
		guild = response;
	});
</script>

<Meta {title} />

<main>
	{#if guild}
		<div class="guild">
			<div class="contents">
				<div class="info">
					<div>
						<img
							class="icon"
							src={guild.icon
								? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp`
								: "/discord.webp"}
							alt=""
						/>
					</div>
					<div>
						<p class="name">{guild.name}</p>
						<div class="informations">
							<p>ID: {guild.guildId}</p>
							<p>INVITE: {guild.invite}</p>
						</div>
					</div>
				</div>
				<div class="control">
					<div>
						<p class="title">コントロール</p>
					</div>
					<div>
						<button>サーバー上位表示</button>
						<button>イベントブーストを設定</button>
					</div>
					<div>
						<button onclick={redirectUrl(`/guilds/${guildId}`)}>サーバーページを見る</button>
					</div>
					<div>
						<button onclick={redirectUrl(`/account/guild/${guildId}/delete`)}
							>サーバーをDistopiaから消す</button
						>
					</div>
				</div>
				<div class="page">
					<div>
						<p class="title">
							現在の設定 <button onclick={redirectUrl(`/account/guild/${guildId}/edit`)}
								>編集</button
							>
						</p>
					</div>
					<div class="content">
						<p>タグ</p>
						<div class="tags">
							{@render generateTagsElement(guild.tags)}
						</div>
					</div>
					<div class="content">
						<p>カテゴリ</p>
						<div>
							<p>{category ?? "ロード中です。"}</p>
						</div>
					</div>
					<div class="content">
						<p>説明欄</p>
						<div>
							{@render description(guild.description)}
						</div>
					</div>
					<div class="content">
						<p>NSFW</p>
						<div>
							<p>{guild.nsfw ? "有効" : "無効"}</p>
						</div>
					</div>
				</div>
				<div class="moreinfo">
					<div>
						<p class="title">詳細情報</p>
					</div>
					{#if guild.level}
						<div class="content">
							<p>レベル</p>
							<div>
								<p>{guild.level.level}レベル</p>
								<p>{guild.level.point}ポイント</p>
							</div>
						</div>
					{/if}
				</div>
				<div class="data">
					<div>
						<p class="title">データ (月間)</p>
					</div>
					<div class="content">
						<p>サーバー参加人数</p>
						<div>
							<p>未実装</p>
						</div>
					</div>
					<div class="content">
						<p>アクティブレート</p>
						<div>
							<p>{guild.activeRate ?? 0}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<p>ロード中です。</p>
	{/if}
</main>
<Footer />

{#snippet generateTagsElement(tags: string[])}
	{#each tags as tag (tag)}
		<p class="tag">{tag}</p>
	{/each}
{/snippet}

{#snippet description(content: string)}
	{#each content.split("\n") as line (line)}
		<p>{line}</p>
	{/each}
{/snippet}

<style>
	button {
		cursor: pointer;
		border-radius: 25px;
		color: white;
		background-color: rgb(49, 49, 49);
		opacity: 0.8;
		font-size: 14px;
		padding: 4px 8px;
		border: 1px solid rgb(85, 85, 85);
	}
	button:active {
		border: 1px solid rgb(49, 49, 49);
		background-color: rgb(85, 85, 85);
	}
	.control > div {
		margin-top: 5px;
	}
	.tag {
		padding: 3px 5px;
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
	.contents > div > .content > p {
		font-size: 18px;
		font-weight: 600;
		margin-top: 4px;
	}
	.contents > div .title {
		font-weight: 700;
		font-size: 24px;
		margin-top: 10px;
	}
	.contents > div {
		margin: 10px 0;
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
