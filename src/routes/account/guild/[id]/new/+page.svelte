<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Header from "$lib/header.svelte";
    import Footer from "$lib/footer.svelte";

    import { onMount } from "svelte";
    import { getTmpGuild, GuildsApiError } from "$lib/guilds.svelte";
	import { CATEGORIES } from "$lib/category.svelte";
	import { CHARACTER_LIMIT } from "$lib/constants.svelte"

    import type { PageData } from "./$types";

	type TmpGuild = {
		guildId: string;
		userId: string;
		name: string;
		invite: string;
		icon: string | null;
		banner: string | null;
	}

    const { data }: { data: PageData } = $props();
    const { guildId } = data;
    const loginData = $state(data.auth);
	let tmpGuild = $state<TmpGuild | null>(null);
    let title = $state("Loading...");
	let category = $state("other");
	let description = $state("");
	let nsfw = $state(false);
	let agreement = $state(false);
	let descriptionLength = $derived(description.length);

	function updateSettings() {
		if (tmpGuild) {
			title = `「${tmpGuild.name}」を本登録する。`;
		}
	}

    onMount(async () => {
        if (!loginData) {
            return location.href = "/";
        }
        const response = await getTmpGuild(loginData.token, guildId);
		if (response instanceof GuildsApiError) {
			return location.href = "/account";
		}
		tmpGuild = response;
		updateSettings();
    })
</script>

<Meta title={title}/>

<Header userData={loginData}/>
<main>
	{#if tmpGuild}
		<div class="guild">
			<div class="contents">
				<div class="info">
					<div>
						<img class="icon" src="{tmpGuild.icon ? `https://cdn.discordapp.com/icons/${tmpGuild.guildId}/${tmpGuild.icon}.webp` : "/discord.webp"}" alt="">
					</div>
					<div>
						<p class="name">{tmpGuild.name}</p>
						<div class="informations">
							<p>ID: {tmpGuild.guildId}</p>
							<p>INVITE: {tmpGuild.invite}</p>
						</div>
					</div>
				</div>
				<div class="registers">
					<div class="section">
						<p class="title">カテゴリ</p>
						<select onchange={e => { category = e.currentTarget.value; }} bind:value={category}>
							{#each CATEGORIES as category}
								<option value="{category.id}">{category.name}</option>
							{/each}
						</select>
					</div>
					<div class="section">
						<p class="title">タグ <small>(Enterで確定・{CHARACTER_LIMIT.tag}文字制限)</small></p>
						<input type="text" maxlength="{CHARACTER_LIMIT.tag}">
					</div>
					<div class="section">
						<p class="title">サーバーの説明 <strong style={`color: ${descriptionLength > CHARACTER_LIMIT.description ? "red" : "green" };`}>({descriptionLength} / {CHARACTER_LIMIT.description})</strong></p>
						<textarea bind:value={description}></textarea>
					</div>
					<div class="section">
						<p class="title"><input type="checkbox" bind:checked={nsfw}>NSFWサーバー</p>
					</div>
					<div class="section">
						<p class="title"><input type="checkbox" bind:checked={agreement}>本サービス規約に同意する。</p>
					</div>
					<div class="section">
						<button>サーバーを公開</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>
<Footer/>

<style>
	.section input[type="checkbox"] {
		margin: 0 5px 0 0;
	}
	.section input[type="text"] {
		font-size: 20px;
		width: 70%;
	}
	.section textarea {
		resize: none;
		width: 95%;
		height: 35vh;
	}
	.section button {
		cursor: pointer;
		background-color: rgb(39, 39, 39);
		border-color: rgb(134, 134, 134);
		color: rgb(193, 193, 193);
		width: 100%;
		font-size: 20px;
		font-weight: 600;
		padding: 10px 0;
	}
	.section {
		margin: 15px 0;
	}
	.section .title {
		font-weight: 600;
		font-size: 20px;
	}
	.registers {
		margin-top: 20px;
	}
	.contents {
		margin: 10px 20px;
		overflow: hidden;
	}
	.guild .name {
		font-weight: 800;
        font-size: 30px;
	}
	.guild .informations p {
		font-size: 10px;
	}
	.guild .info div {
		display: inline-block;
	}
    .guild .icon {
        height: 90px;
        border-radius: 50%;
    }
	.guild {
        overflow: hidden;
        display: block;
        background-color: rgb(37, 36, 41);
        border-radius: 20px;
        width: 90%;
        margin: 20px auto;
	}
	p {
		color: white;
	}
</style>
