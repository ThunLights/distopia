<script lang="ts">
	import Tags from "$lib/tags.svelte";

	import { CATEGORIES } from "./category.svelte";
	import { CHARACTER_LIMIT, TAG_COUNT_LIMIT } from "./constants.svelte";
	import { descriptionFormatCheck } from "./description.svelte";

	export type Guild = {
		guildId: string
		userId: string
		name: string
		invite: string
		icon: string | null
		banner: string | null

		description: string
		category: string
		tags: string[]
		nsfw: boolean
	}

	export type Props = {
		guild: Guild
		token: string
		method: string
	}

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
		const data = descriptionFormatCheck(description)
			&& agreement;
		disabled = !data;
	}

	async function register() {
		disabled = false;
		const response = await fetch(`/api/guilds/new`, {
			method,
			headers: {
				Authorization: token,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				guildId, nsfw, tags, category, description,
			}),
		});
		if (response.ok) {
			location.href = `/account/guild/${guildId}`;
		} else {
			result = "エラーが発生しました。"
			disabled = true;
		}
	}

	setInterval(() => {
		isTransmittable();
	}, 500)
</script>

<main>
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
			<div class="registers">
				<div class="section">
					<p class="title"><small class="indispensable">*</small>カテゴリ</p>
					<select onchange={e => { category = e.currentTarget.value; }} bind:value={category}>
						{#each CATEGORIES as category}
							<option value="{category.id}">{category.name}</option>
						{/each}
					</select>
				</div>
				<div class="section">
					<p class="title">タグ <small>(Enterで確定・{CHARACTER_LIMIT.tag}文字制限・{TAG_COUNT_LIMIT}個まで)</small></p>
					<Tags tags={tags} tagsUpdate={(newTags) => { tags = newTags }}></Tags>
				</div>
				<div class="section">
					<p class="title"><small class="indispensable">*</small>サーバーの説明 <strong style={`color: ${descriptionLength > CHARACTER_LIMIT.description ? "red" : "green" };`}>({descriptionLength} / {CHARACTER_LIMIT.description})</strong></p>
					<textarea bind:value={description}></textarea>
				</div>
				<div class="section">
					<p class="title"><input type="checkbox" bind:checked={nsfw}>NSFWサーバー</p>
				</div>
				<div class="section">
					<p class="title"><input type="checkbox" bind:checked={agreement}><small class="indispensable">*</small>本サービス規約に同意する。</p>
				</div>
				<div class="section">
					<button style={disabled ? "" : "cursor: pointer;"} onclick={register} disabled={disabled}>サーバーを公開</button>
				</div>
				<div class="section">
					<p style="color: red;">{result}</p>
				</div>
			</div>
		</div>
	</div>
</main>

<style></style>
