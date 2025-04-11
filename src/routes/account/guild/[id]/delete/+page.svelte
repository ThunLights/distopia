<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import Footer from "$lib/components/footer.svelte";

	import { onMount } from "svelte";
	import { getPublicGuild, GuildsApiError } from "$lib/client/guilds";

	import type { PageData } from "./$types";
	import type { Response } from "$routes/api/guilds/public/[id]/+server";

	const { data }: { data: PageData } = $props();
	const { guildId } = data;
	let guild = $state<Response | null>(null);
	let title = $derived(guild ? `「${guild.name}」を削除する` : "Loading...");
	let result = $state("");

	onMount(async () => {
		if (!data.auth) {
			return (location.href = "/account");
		}
		const response = await getPublicGuild(data.auth.token, guildId);
		if (response instanceof GuildsApiError) {
			return (location.href = "/account");
		}
		guild = response;
	});

	async function guildDelete() {
		if (!(data.auth && guild)) {
			result = "削除に必要な内部情報が不十分です。";
			return;
		}
		const response = await fetch(`/api/guilds/delete`, {
			method: "DELETE",
			headers: {
				Authorization: data.auth.token,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				guildId: guild.guildId
			})
		});
		if (response.ok) {
			location.href = "/account";
			return;
		}
	}

	function goBack() {
		return (location.href = `/account${guild ? `/guild/${guild.guildId}` : ""}`);
	}
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
					<div class="section">
						<p class="title">
							本当に削除しますか? <small>サーバーレベルなどすべてリセットされます。</small>
						</p>
						<div>
							<button onclick={guildDelete}>削除する</button>
							<button onclick={goBack}>戻る</button>
						</div>
					</div>
				</div>
				<p style="color: red;">{result}</p>
			</div>
		</div>
	{/if}
</main>
<Footer fixed={true} />

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
