<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Icon from "$lib/icon.svelte";

	import { generateEdge } from "$lib/edge.svelte.js";

	import type { Guild } from "$lib/server/guild";

	type OnChangeEvent = Event & {
		currentTarget: EventTarget & HTMLSelectElement;
	};

	const { data } = $props();
	const { searchType, level, activeRate } = data;

	function moveOtherType(e: OnChangeEvent) {
		location.href = `/ranking?type=${e.currentTarget.value}`;
	}
</script>

<Meta title="Distopiaサーバーランキング"/>

<main>
	<div class="contents">
		<div class="context">
			<div class="context-menu">
				<p class="title">ランキング</p>
				<div class="search-type-changer">
					<select value={searchType} onchange={moveOtherType}>
						<option value="level">レベル</option>
						<option value="activeRate">アクティブレート</option>
					</select>
				</div>
			</div>
			<div class="ranking">
				{#if searchType === "activeRate"}
					{#each activeRate as guild, i}
						{@render generateGuild(guild, i, true)}
					{/each}
				{:else}
					{#each level as guild, i}
						{@render generateGuild(guild, i, false)}
					{/each}
				{/if}
			</div>
		</div>
	</div>
</main>

{#snippet generateGuild(guild: Guild, rank: number, edge: boolean)}
	<div class="guild">
		<div>
			{#if edge}
				<Icon imgStyle="width: 10vw;" iconPath={guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"} edgePath={`/ranking/${generateEdge(rank)}.webp`}/>
			{:else}
				<img class="icon" src={guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"} alt="">
			{/if}
		</div>
		<div>
			<p class="name">{rank+1}: {guild.name}</p>
			<div class="informations">
				<p>Rate {guild.activeRate ?? 0} Lv.{guild.level ? guild.level.level : 0} {guild.level ? guild.level.point : 0}pt</p>
				<p>{guild.members ?? 0}人(アクティブ: {guild.online})</p>
			</div>
		</div>
		<div>
			<a href="/guilds/{guild.guildId}"><p class="move-page">詳細→</p></a>
		</div>
	</div>
{/snippet}

<style>
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
	a, p {
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
