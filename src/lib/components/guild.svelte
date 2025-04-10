<script lang="ts">
	import Tags from "$lib/tags.svelte";

	import { CATEGORIES } from "../category";
	import { CHARACTER_LIMIT, TAG_COUNT_LIMIT } from "../constants";
	import { descriptionFormatCheck } from "../description.svelte";

	type Guild = {
		guildId: string;
		name: string;
		invite: string;
		icon: string | null;
		banner: string | null;

		description: string;
		category: string;
		tags: string[];
		nsfw: boolean;
	};

	type Props = {
		guild: Guild;
		token: string;
		method: string;
	};

	const { guild, token, method }: Props = $props();
	const { guildId } = guild;
	let tags = $state(guild.tags);
	let category = $state(guild.category);
	let description = $state(guild.description);

	let nsfw = $state(guild.nsfw);
	let result = $state("");
	let disabled = $state(true);
	let agreement = $state(false);
	let descriptionLength = $derived(description.length);

	function isTransmittable() {
		const data = descriptionFormatCheck(description) && agreement;
		disabled = !data;
	}

	async function register() {
		disabled = false;
		const response = await fetch(`/api/guilds/new`, {
			method,
			headers: {
				Authorization: token,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				guildId,
				nsfw,
				tags,
				category,
				description
			})
		});
		if (response.ok) {
			location.href = `/account/guild/${guildId}`;
		} else {
			const json = await response.json();
			result = `エラーが発生しました: ${json.content}`;
			disabled = true;
		}
	}

	setInterval(() => {
		isTransmittable();
	}, 500);
</script>

<main>
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
			<div class="registers">
				<div class="section">
					<p class="title"><small class="indispensable">*</small>カテゴリ</p>
					<select
						onchange={(e) => {
							category = e.currentTarget.value;
						}}
						bind:value={category}
					>
						{#each CATEGORIES as category (category)}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>
				<div class="section">
					<p class="title">
						タグ <small>(Enterで確定・{CHARACTER_LIMIT.tag}文字制限・{TAG_COUNT_LIMIT}個まで)</small
						>
					</p>
					<Tags
						{tags}
						tagsUpdate={(newTags) => {
							tags = newTags;
						}}
					></Tags>
				</div>
				<div class="section">
					<p class="title">
						<small class="indispensable">*</small>サーバーの説明
						<strong
							style={`color: ${descriptionLength > CHARACTER_LIMIT.description ? "red" : "green"};`}
							>({descriptionLength} / {CHARACTER_LIMIT.description})</strong
						>
					</p>
					<textarea bind:value={description}></textarea>
				</div>
				<div class="section">
					<p class="title"><input type="checkbox" bind:checked={nsfw} />NSFWサーバー</p>
				</div>
				<div class="section">
					<p class="title">
						<input type="checkbox" bind:checked={agreement} /><small class="indispensable">*</small
						>本サービス規約に同意する。
					</p>
				</div>
				<div class="section">
					<button
						class={disabled ? "" : "button"}
						style={disabled ? "" : "cursor: pointer;"}
						onclick={register}
						{disabled}>サーバーを公開</button
					>
				</div>
				<div class="section">
					<p style="color: red;">{result}</p>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	textarea {
		resize: none;
		width: 95%;
		height: 45vh;
	}
	button {
		width: 100%;
		border-radius: 25px;
		color: white;
		background-color: rgb(49, 49, 49);
		opacity: 0.8;
		font-size: 14px;
		padding: 4px 8px;
		border: 1px solid rgb(85, 85, 85);
	}
	.button:active {
		border: 1px solid rgb(49, 49, 49);
		background-color: rgb(85, 85, 85);
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
