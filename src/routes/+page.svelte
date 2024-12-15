<script lang="ts">
    import { onMount } from "svelte";
    import { getMeridiem } from "$lib/time.svelte";
	import { home } from "$lib/api.svelte";
	import { getCategory } from "$lib/category.svelte";
	import { redirectUrl } from "$lib/redirect.svelte";
	import { guildJoin } from "$lib/join.svelte";
	import { generateEdge } from "$lib/edge.svelte";

    import Meta from "$lib/meta.svelte";
    import Footer from "$lib/footer.svelte";
	import Icon from "$lib/icon.svelte";

    import type { PageData } from "./$types";
	import type { Guild } from "$lib/server/guild";
	import type { Response } from "$routes/api/home/+server";

	const { data }: { data: PageData } = $props();
	const initServersData = {
		content: [],
		active: [],
	} satisfies Response;

    let bgUrl = $state("");
	let searchWord = $state("");
    let loginData = $state(data.auth);
	let servers = $state<Response>(initServersData);

    onMount(async () => {
        bgUrl = getMeridiem(navigator.language) === "AM" ? "/am.webp" : "/pm.webp";
		servers = await home() ?? initServersData;
    })

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

    async function search() {
        location.href = `/search?content=${encodeURIComponent(searchWord)}`
    }

    async function inputSearchCommand(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            await search()
        }
    }
</script>

<Meta></Meta>

<main>
    <div class="entrance-img">
        <img src="{bgUrl}" alt="loading">
    </div>
	<div class="contents">
		<div>
			<p class="name">あなたにピッタリなDiscordサーバーを見つける</p>
			<div>
				<input class="search-input" type="text" spellcheck="false" autocomplete="off" onkeyup={inputSearchCommand} bind:value={searchWord}>
				<button onclick={search}>検索</button>
			</div>
		</div>
		<div>
			<p class="name">最近更新されたサーバー</p>
			<div class="guilds">
				{#each servers.content as guild}
					{@render generateGuildElement(guild)}
				{/each}
			</div>
		</div>
		<div>
			<p class="name">アクティブなサーバー</p>
			<div class="guilds">
				{#each servers.active as guild}
					{@render generateGuildElement(guild)}
				{/each}
			</div>
		</div>
	</div>
</main>
<Footer></Footer>

{#snippet generateGuildElement(guild: Guild)}
	<div class="guild">
		<div class="guild-context">
			<div>
				<div class="guild-info">
					<div>
						<a class="white" href="/guilds/{guild.guildId}">
							{#if guild.ranking.activeRate && guild.ranking.activeRate < 50}
								<Icon imgStyle="height: 60px;" iconPath={guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"} edgePath="/ranking/{generateEdge(guild.ranking.activeRate-1)}.webp"/>
							{:else}
								<img class="icon" src="{guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"}" alt="">
							{/if}
						</a>
					</div>
					<div>
						<a class="white" href="/guilds/{guild.guildId}"><p class="guild-name">{guild.name}</p></a>
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
			<div class="join-btn">
				<button onclick={redirectUrl(`/guilds/${guild.guildId}`)}>
					<a href="/guilds/{guild.guildId}" class="button-a-tag">詳細を閲覧</a>
				</button>
				<div></div>
				<button onclick={joinBtn(guild.guildId, guild.invite, guild.name)}>サーバーに参加</button>
			</div>
		</div>
	</div>
{/snippet}

<style>
	.join-btn {
		display: grid;
		grid-template-columns: 49% 2% 49%;
	}
	.white {
		text-decoration: none;
		color: white;
	}
	.search-input {
		width: 60%;
		font-size: 15px;
		border-radius: 25px;
		padding: 4px 8px;
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
	.contents>div .name {
		margin-top: 14px;
		font-size: 30px;
		font-weight: 700;
	}
	.contents {
		overflow: hidden;
		width: 95%;
		margin: 30px auto;
	}
	.button-a-tag {
		color: white;
		text-decoration: none;
	}
    main {
        width: 100%;
        overflow: hidden;
    }
    .entrance-img img {
        width: 100%;
        height: auto;
    }
	p, pre {
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
