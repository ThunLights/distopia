<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Icon from "$lib/icon.svelte";

	import { onMount } from "svelte";
	import { getCategory } from "$lib/category";
	import { guildJoin } from "$lib/join.svelte";
	import { redirectUrl } from "$lib/redirect.svelte";
	import { generateEdge } from "$lib/edge.js";
	import { blank } from "$lib/blank";

	import type { Guild } from "$lib/server/guild";
	import type { Response } from "$routes/api/search/+server.js";
	import { PUBLIC_URL } from "$env/static/public";

	const { data } = $props();
	let searchWord = $state(data.searchWord);
	let guilds = $state<Guild[]>([]);
	let loginData = $state(data.auth);

	onMount(async () => {
		if (!blank(searchWord)) {
			const response = await fetch("/api/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					content: searchWord,
				}),
			})
			if (response.ok) {
				const json: Response = await response.json();
				guilds = json.guilds;
			}
		}
	})

    async function search() {
        location.href = `/search?content=${encodeURIComponent(searchWord)}`
    }

    async function inputSearchCommand(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            await search()
        }
    }

	function joinBtn(guildId: string, invite: string, name: string) {
		if (loginData) {
			const { token } = loginData;
			return async () => {
				await guildJoin(token, guildId, name);
			}
		} else {
			return redirectUrl(`https://discord.gg/${invite}`);
		}
	}
</script>

<Meta
	title={`「${searchWord}」の検索結果を表示`}
	description={[
		`「${searchWord}」の検索結果です。`,
		"現在沢山のサーバーが登録されています。",
		"他ワードも試してみてください。",
	].join("")}
/>

<svelte:head>
	<link rel="canonical" href="{PUBLIC_URL}/search">
</svelte:head>

<main>
	<div class="contents">
		<div class="context">
			<div>
				<div>
					<input class="search-input" type="text" spellcheck="false" autocomplete="off" onkeyup={inputSearchCommand} bind:value={searchWord}>
					<button onclick={search}>検索</button>
				</div>
				<div class="guilds-count">
					<p>{guilds.length}件のサーバーがヒット</p>
				</div>
			</div>
			{#if guilds.length}
				<div class="guilds">
					{#each guilds as guild}
						{@render generateGuildElement(guild)}
					{/each}
				</div>
			{:else}
				<p>「{searchWord}」の検索結果は0件でした。</p>
			{/if}
		</div>
	</div>
</main>

{#snippet generateGuildElement(guild: Guild)}
	<div class="guild">
		<div class="guild-context">
			<div>
				<div class="guild-info">
					<div>
						{#if guild.ranking.activeRate && guild.ranking.activeRate < 50}
							<Icon height={60} width={60} iconPath={guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/ranking/discord.webp"} edgePath="/ranking/{generateEdge(guild.ranking.activeRate-1)}.webp"/>
						{:else}
							<img class="icon" src="{guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"}" alt="">
						{/if}
					</div>
					<div>
						<p class="guild-name">{guild.name}</p>
						<p>ブースト: {guild.boost}</p>
						<p>カテゴリ: {getCategory(guild.category)}</p>
					</div>
				</div>
				<div>
					{#if guild.tags.length}
						<p>タグ</p>
						<div class="tags">
							{#each guild.tags as tag}
								<div class="tag">
									<p class="content">{tag}</p>
								</div>
							{/each}
						</div>
					{/if}
					<p>説明</p>
					<pre>{guild.description}</pre>
				</div>
			</div>
			<div>
				<button onclick={redirectUrl(`/guilds/${guild.guildId}`)}>
					<a href="/guilds/{guild.guildId}" class="button-a-tag">詳細を閲覧</a>
				</button>
				<button onclick={joinBtn(guild.guildId, guild.invite, guild.name)}>サーバーに参加</button>
			</div>
		</div>
	</div>
{/snippet}

<style>
	.search-input {
		width: 60%;
		font-size: 15px;
		border-radius: 25px;
		padding: 4px 8px;
	}
	.guilds-count {
		text-align: right;
	}
	.tags {
		margin: 7px auto;
		width: 100%;
	}
	.tag {
		border-radius: 25px;
		background-color: rgb(66, 66, 66);
		display: inline-block;
		margin-right: 10px;
		margin-bottom: 6px;
	}
	.tag p {
		display: inline-block;
		color: white;
	}
	.tag .content {
		margin: 3px 5px;
	}
	.guild-info .icon {
		border-radius: 50%;
		height: 60px;
	}
	.guild-info p {
		font-size: 8px;
	}
	.guild-info p.guild-name {
		font-size: 16px;
		font-weight: 700;
	}
	.guild-info {
		display: grid;
		gap: 6px;
		grid-template-rows: 100%;
		grid-template-columns: auto 1fr;
	}
	.guild {
		overflow: hidden;
		border-radius: 30px;
		background-color: rgb(40, 40, 40);
		margin: 8px;
	}
	.guilds {
		display: grid;
		grid-template-columns: 32% 32% 32%;
		grid-template-rows: auto auto auto auto auto auto auto auto auto auto auto;
	}
	.guild-context>div {
		margin-bottom: 8px;
	}
	.guild-context {
		overflow: hidden;
		display: grid;
		grid-template-rows: 1fr auto;
		grid-template-columns: 100%;
		height: 95%;
		margin: 14px;
	}
	.guild-context {
		overflow: hidden;
		display: grid;
		grid-template-rows: 1fr auto;
		grid-template-columns: 100%;
		height: 95%;
		margin: 14px;
	}
	.contents>div .name {
		margin-top: 14px;
		font-size: 30px;
		font-weight: 700;
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
	p, pre, a {
		color: white;
	}
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
	@media (max-width: 1100px) {
		.guilds {
			grid-template-columns: 48% 48%;
		}
		.contents>div .name {
			font-size: 24px;
		}
	}
	@media (max-width: 800px) {
		.guilds {
			grid-template-columns: 98%;
		}
		.contents>div .name {
			font-size: 20px;
		}
	}
</style>
