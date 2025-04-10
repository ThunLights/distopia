<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import Icon from "$lib/components/icon.svelte";

	import { generateEdge } from "$lib/edge";
	import { onMount } from "svelte";

	import type { Guild } from "$lib/server/guild";
	import type { ResponseJson } from "$routes/api/guilds/ranking/+server";

	type OnChangeEvent = Event & {
		currentTarget: EventTarget & HTMLSelectElement;
	};

	const { data } = $props();
	const { searchType } = data;

	let contents = $state<ResponseJson["post"]>({
		level: [],
		activeRate: [],
		users: []
	});

	onMount(async () => {
		const response = await fetch("/api/guilds/ranking", {
			method: "POST"
		});
		if (response.status === 200) {
			contents = await response.json();
		}
	});

	function moveOtherType(e: OnChangeEvent) {
		location.href = `/ranking?type=${e.currentTarget.value}`;
	}
</script>

<Meta
	title="Distopiaサーバーランキング"
	description={[
		"Distopiaのサーバーランキングです。",
		"カテゴリはアクティブレートとレベルの二つがあります。",
		"(20分ごとに更新されます。)"
	].join("")}
/>

<main>
	<div class="contents">
		<div class="context">
			<div class="context-menu">
				<p class="title">ランキング</p>
				<div class="search-type-changer">
					<select value={searchType} onchange={moveOtherType}>
						<option value="level">レベル</option>
						<option value="activeRate">アクティブレート</option>
						<option value="userBump">ユーザーBumpランキング</option>
					</select>
				</div>
			</div>
			<div class="ranking">
				{#if searchType === "activeRate"}
					{#each contents.activeRate as guild, i (guild)}
						{@render generateGuild(guild, i, true)}
					{/each}
				{:else if searchType === "level"}
					{#each contents.level as guild, i (guild)}
						{@render generateGuild(guild, i, false)}
					{/each}
				{:else}
					{#each contents.users as user, i (user)}
						{@render generateUser(user, i)}
					{/each}
				{/if}
			</div>
		</div>
	</div>
</main>

{#snippet generateGuild(guild: Guild, rank: number, edge: boolean)}
	<div class="guild">
		<div>
			<a class="white" href="/guilds/{guild.guildId}">
				{#if edge}
					<Icon
						width="10vw"
						height="10vw"
						iconPath={guild.icon
							? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp`
							: "/ranking/discord.webp"}
						edgePath={`/ranking/${generateEdge(rank)}.webp`}
					/>
				{:else}
					<img
						class="icon"
						src={guild.icon
							? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp`
							: "/discord.webp"}
						alt=""
					/>
				{/if}
			</a>
		</div>
		<div>
			<p><a class="name white" href="/guilds/{guild.guildId}">{rank + 1}: {guild.name}</a></p>
			<div class="informations">
				<p>
					Rate {guild.activeRate ?? 0} Lv.{guild.level ? guild.level.level : 0}
					{guild.level ? guild.level.point : 0}pt
				</p>
				<p>{guild.members ?? 0}人(アクティブ: {guild.online})</p>
			</div>
		</div>
		<div>
			<a href="/guilds/{guild.guildId}"><p class="move-page">詳細→</p></a>
		</div>
	</div>
{/snippet}

{#snippet generateUser(content: (typeof contents.users)[number], rank: number)}
	<div class="guild">
		<div>
			<img class="icon" src={content.avatarUrl} alt="" />
		</div>
		<div>
			<p class="name white">{rank + 1}: {content.displayName}</p>
			<div class="informations">
				<p>合計: {content.count}回</p>
				<p>ユーザーネーム: {content.username} (ID: {content.userId})</p>
			</div>
		</div>
	</div>
{/snippet}

<style>
	.white {
		color: white;
	}
	.guild .name {
		font-size: 20px;
		font-weight: 700;
	}
	.guild .icon {
		border-radius: 50%;
		width: 10vw;
	}
	.guild {
		margin-bottom: 10px;
		display: grid;
		gap: 20px;
		grid-template-columns: auto 1fr auto;
		align-items: center;
	}
	.move-page {
		font-size: 20px;
	}
	.title {
		font-size: 30px;
		font-weight: 700;
		margin-top: 10px;
	}
	.search-type-changer select {
		color: rgb(201, 201, 201);
		border-radius: 25px;
		background-color: rgb(85, 85, 85);
		padding: 5px 10px;
		font-weight: 700;
	}
	.search-type-changer {
		text-align: right;
	}
	.context-menu {
		margin-bottom: 18px;
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
	a,
	p {
		font-size: 15px;
		text-decoration: none;
		color: white;
	}
	@media (max-width: 800px) {
		.guild .name {
			font-size: 16px;
		}
		.move-page {
			font-size: 14px;
		}
	}
	@media (max-width: 600px) {
		.guild .name {
			font-size: 14px;
		}
		.move-page {
			font-size: 12px;
		}
		p {
			font-size: 10px;
		}
	}
	@media (max-width: 450px) {
		.guild .name {
			font-size: 12px;
		}
		.move-page {
			font-size: 10px;
		}
		p {
			font-size: 8px;
		}
	}
</style>
