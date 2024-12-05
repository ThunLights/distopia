<script lang="ts">
	import Icon from "$lib/icon.svelte";

	import type { Guild } from "$lib/server/guild";

	const { data } = $props();
	const { searchType, level, activeRate } = data;

	function generateEdge(rank: number) {
		if (rank < 1) return 1;
		if (rank < 2) return 2;
		if (rank < 3) return 3;
		if (rank < 10) return 10;
		if (rank < 30) return 30;
		return 50;
	}
</script>

<main>
	<div class="contents">
		<div class="context">
			<div>
				<p class="title">ランキング</p>
			</div>
			<div class="ranking">
				{#if searchType === "activeRate"}
					{#each activeRate as guild, i}
						{@render generateGuild(guild, i)}
					{/each}
				{:else}
					{#each level as guild}
						{@render generateGuild(guild)}
					{/each}
				{/if}
			</div>
		</div>
	</div>
</main>

{#snippet generateGuild(guild: Guild, rank?: number)}
	<div class="guild">
		<div>
			{#if rank === undefined}
				<img src={`https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp`} alt="">
			{:else}
				<Icon imgStyle="" iconPath={`https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp`} edgePath={`/ranking/${generateEdge(rank)}.webp`}/>
			{/if}
		</div>
		<div>
			<p class="name">{guild.name}</p>
			<div class="informations">
				<p>Lv.{guild.level ? guild.level.level : 0}</p>
			</div>
		</div>
		<div>
			<p><a href="/guilds/{guild.guildId}">詳細</a></p>
		</div>
	</div>
{/snippet}

<style>
	.title {
		font-size: 22px;
		font-weight: 700;
		margin-top: 10px;
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
</style>
