<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Footer from "$lib/footer.svelte";
	import Icon from "$lib/icon.svelte";

	import { onMount } from "svelte";
	import { token2data } from "$lib/auth.svelte";
	import { getCategory } from "$lib/category.svelte";
	import { redirectUrl } from "$lib/redirect.svelte";
	import { toast } from "@zerodevx/svelte-toast";
	import { guildJoin } from "$lib/join.svelte";
	import { generateEdge } from "$lib/edge.js";

    import type { PageData } from "./$types";
	import type { Response } from "$routes/api/guilds/public/[id]/+server";

	type Auth = {
		token: string;
		id: string;
		username: string;
		email: string | null;
		avatar: string | null;
	}

    const { data }: { data: PageData } = $props();
	const { guildId, content } = data;
	const guild = $state<Response | null>(content);
	const reviews = $derived(guild ? guild.reviews : []);
	const title = $derived(content ? `「${content.name}」のページ` : `ID:${guildId} は見つかりませんでした。`);

    let loginData = $state<Auth | null>(data.auth);

	onMount(async () => {
		loginData = await token2data();
	})

	function joinBtn() {
		if (!guild) {
			toast.push(`ERROR: GUILD_DATA_NOT_FOUND`, {
				theme: {
					"--toastBackground": "rgb(168, 13, 13)",
				}
			})
			return () => {};
		}
		const { guildId, invite, name } = guild;
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
	title={title}
	description={guild ? guild.description.replaceAll("\n", "").replaceAll(/\s+/g, "") : undefined}
/>

<main>
	{#if guild}
		<div class="contents">
			<div class="context">
				<div class="guild-info">
					<div>
						{#if guild.ranking.activeRate && guild.ranking.activeRate < 50}
							<Icon imgStyle="height: 128px;" iconPath={guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"} edgePath="/ranking/{generateEdge(guild.ranking.activeRate-1)}.webp"/>
						{:else}
							<img class="guild-icon" src="{guild.icon ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.icon}.webp` : "/discord.webp"}" alt="">
						{/if}
					</div>
					<div>
						<p class="guild-name">{guild.name}</p>
						<p>ブースト: {guild.boost}</p>
						<p>カテゴリ: {getCategory(guild.category)}</p>
					</div>
				</div>
				<div>
					<p class="name">タグ一覧</p>
					<div class="tags">
						{#each guild.tags as tag}
							<a class="tag" href="/search?tag={tag}">
								<div class="content">
									<p>{tag}</p>
								</div>
							</a>
						{/each}
					</div>
				</div>
				<div>
					<p class="name">説明</p>
					<div>
						{#each guild.description.split("\n") as line}
							<p>{line}</p>
						{/each}
					</div>
				</div>
				<div>
					<p class="name">ランキング (アクティブレート)</p>
					<div>
						<p>現在: {guild.ranking.activeRate ?? "圏外"}</p>
						<p>最高: {guild.archives.activeRate.ranking}</p>
					</div>
				</div>
				<div>
					<p class="name">ランキング (レベル)</p>
					<div>
						<p>現在: {guild.ranking.level ?? "圏外"}</p>
						<p>最高: {guild.archives.level.ranking}</p>
					</div>
				</div>
				<div>
					<p class="name">詳細</p>
					<div>
						<div>
							<p>{guild.level ? `Lv.${guild.level.level} ${guild.level.point}pt` : "Lv.0"}</p>
							<p>アクティブレート: {guild.activeRate ?? 0} (最大: {guild.archives.activeRate.max})</p>
						</div>
					</div>
				</div>
				<div>
					<p class="name">イベントカレンダー</p>
					<div>
						<p>イベントが登録されていません</p>
					</div>
				</div>
				<div>
					<button onclick={joinBtn()} class="join-button">「{guild.name}」に参加</button>
				</div>
			</div>
		</div>
		<div class="contents">
			<div class="context">
				<p class="name">評価: {guild.review.toFixed(2)}</p>
				<div>
					{#each Array(5) as _, i}
						<div class="star">
							<p><img src="/review/star.webp" alt="">{i+1}</p>
							<p><progress max="{reviews.length}" value="{reviews.filter(value => value.star === i+1).length}"></progress> {reviews.filter(value => value.star === i+1).length}個</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="contents">
			<div class="context">
				<p class="name">レビュー {#if loginData}
					<button class="review-button" onclick={redirectUrl(`/guilds/${guildId}/review`)}><a href="/guilds/{guildId}/review">レビューを投稿する</a></button>
				{/if}</p>
				<div>
					{#if reviews.length}
						<div class="reviews">
							{#each reviews as review}
								<div class="review">
									<div class="context">
										<div class="user">
											<div>
												<img class="icon" src="{review.user.avatar ? `https://cdn.discordapp.com/avatars/${review.userId}/${review.user.avatar}.webp` : "/discord.webp"}" alt="">
											</div>
											<div>
												<p class="name">{review.user.username}</p>
											</div>
										</div>
										<div class="stars">
											<div class="inline-block">
												<p class="section-title">評価</p>
											</div>
											{#each Array(5) as _, i}
												<div class="star inline-block">
													<img src={i + 1 <= review.star ? "/review/star.webp" : "/review/blackstar.webp"} alt="">
												</div>
											{/each}
										</div>
										{#if review.content}
											<div>
												<p class="section-title">内容</p>
												<pre>{review.content}</pre>
											</div>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<p>「{guild.name}」はまだレビューされていません</p>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="content">
			<div class="result">
				<p class="not-found">サーバーが見つかりませんでした。</p>
			</div>
		</div>
	{/if}
</main>
<Footer/>

<style>
	.guild-icon {
		height: 128px;
	}
	.section-title {
		font-weight: 700;
	}
	.review {
		overflow: hidden;
		border-radius: 20px;
		background-color: rgb(46, 46, 46);
		margin-top: 12px;
	}
	.review .user>div {
		display: inline-block;
	}
	.review .user .icon {
		margin: 0;
		height: 18px;
	}
	.review .user .name {
		margin: 0;
		line-height: 16px;
		font-size: 16px;
		font-weight: 500;
	}
	.reviews {
		overflow: hidden;
	}
	.inline-block {
		display: inline-block;
	}
	.star {
		font-size: 20px;
	}
	.star img {
		width: 20px;
	}
	.star p {
		display: inline-block;
	}
	.review-button {
		padding: 2px 4px;
	}
	.review-button a {
		font-size: 10px;
	}
	.join-button {
		margin-top: 15px;
		cursor: pointer;
		font-size: 15px;
		font-weight: 800;
		text-align: center;
		padding: 10px;
		width: 100%;
        color: rgb(52, 198, 52);
        background-color: rgb(59, 59, 59);
        border: 1px solid rgb(85, 85, 85);
	}
	.join-button:active {
        border: 1px solid rgb(49, 49, 49);
        background-color: rgb(85, 85, 85);
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
	.tags {
		margin-top: 7px;
		width: 100%;
	}
	.tag {
		border-radius: 25px;
		background-color: rgb(66, 66, 66);
		display: inline-block;
		margin-right: 10px;
	}
	.tag p {
		display: inline-block;
		color: white;
	}
	.tag .content {
		margin: 3px 5px;
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
	.guild-name {
		font-size: 28px;
		font-weight: 700;
	}
	.guild-info>div {
		display: inline-block;
	}
	.guild-info {
		margin-top: 15px;
	}
	a, p, pre {
		font-size: 15px;
		text-decoration: none;
		color: white;
	}
	@media (max-width: 800px) {
		.guild-name {
			font-size: 22px;
		}
		.name {
			font-size: 18px;
		}
	}
</style>
