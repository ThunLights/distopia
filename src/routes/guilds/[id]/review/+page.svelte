<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import Footer from "$lib/components/footer.svelte";

	import { Toast } from "$lib/client/toast";
	import { getCategory } from "$lib/category";
	import { blank } from "$lib/blank";
	import { CHARACTER_LIMIT } from "$lib/constants";

	import type { PageData } from "./$types";

	const { data }: { data: PageData } = $props();
	const { guildId, content, auth } = data;

	const title = $state(
		content ? `「${content.name}」にレビューを投稿する` : "サーバーが見つかりません"
	);
	let description = $state("");
	let agreement = $state(false);
	let stars = $state(1);
	let descriptionLength = $derived(description.length);
	let disabled = $derived(!agreement);

	function setStar(star: number) {
		return () => {
			stars = star;
		};
	}

	async function register() {
		if (!auth) {
			Toast.error("認証情報エラー");
			return;
		}
		const response = await fetch("/api/review", {
			method: "POST",
			headers: {
				Authorization: auth.token,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				guildId,
				star: stars,
				content: blank(description) ? undefined : description
			})
		});
		if (response.ok) {
			location.href = `/guilds/${guildId}`;
		} else {
			Toast.error("エラーが発生しました。再ロードしてください");
		}
	}
</script>

<Meta {title} />

<main>
	<div class="contents">
		<div class="context">
			{#if content}
				<div class="guild-info">
					<div>
						<img
							class="icon"
							src={content.icon
								? `https://cdn.discordapp.com/icons/${content.guildId}/${content.icon}.webp`
								: "/discord.webp"}
							alt=""
						/>
					</div>
					<div>
						<p class="guild-name">
							「<a class="guild-name" href="/guilds/{content.guildId}">{content.name}</a
							>」にレビューを投稿する
						</p>
						<p>ブースト: {content.boost}</p>
						<p>カテゴリ: {getCategory(content.category)}</p>
					</div>
				</div>
				<div class="register">
					<div>
						<p class="name">スター (必須)</p>
						<div>
							{#each [0, 1, 2, 3, 4] as i (i)}
								<button class="star-button" onclick={setStar(i + 1)}>
									<img
										src={i + 1 <= stars ? "/review/star.webp" : "/review/blackstar.webp"}
										class="star"
										alt=""
									/>
								</button>
							{/each}
						</div>
					</div>
					<div>
						<p class="name">
							内容 (任意) <strong
								style={`color: ${descriptionLength > CHARACTER_LIMIT.review ? "red" : "green"};`}
								>({descriptionLength} / {CHARACTER_LIMIT.review})</strong
							>
						</p>
						<div>
							<textarea bind:value={description}></textarea>
						</div>
					</div>
					<div>
						<p class="name">
							<input type="checkbox" bind:checked={agreement} />本サービス規約に同意する。
						</p>
					</div>
					<div>
						<button
							class="send-button {disabled ? '' : 'button'}"
							style={disabled ? "" : "cursor: pointer;"}
							{disabled}
							onclick={register}>「{content.name}」にレビューを追加</button
						>
					</div>
				</div>
			{:else}
				<p class="guild-name">サーバーが見つかりませんでした。</p>
			{/if}
		</div>
	</div>
</main>
<Footer />

<style>
	textarea {
		resize: none;
		width: 95%;
		height: 45vh;
	}
	.star-button {
		border: none;
		background-color: transparent;
	}
	.star {
		cursor: pointer;
		width: 50px;
	}
	.name {
		font-size: 22px;
		font-weight: 700;
		margin-top: 10px;
	}
	.icon {
		margin-right: 10px;
		border-radius: 50%;
	}
	.guild-name {
		font-size: 28px;
		font-weight: 700;
	}
	.guild-info > div {
		display: inline-block;
	}
	.guild-info {
		margin-top: 15px;
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
	.send-button {
		margin-top: 15px;
		font-size: 15px;
		font-weight: 800;
		text-align: center;
		padding: 10px;
		width: 100%;
		color: gray;
		background-color: rgb(59, 59, 59);
		border: 1px solid rgb(85, 85, 85);
	}
	.button {
		color: rgb(68, 206, 237);
		cursor: pointer;
	}
	.button:active {
		border: 1px solid rgb(49, 49, 49);
		background-color: rgb(85, 85, 85);
	}
	a,
	p {
		font-size: 15px;
		text-decoration: none;
		color: white;
	}
</style>
