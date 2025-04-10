<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/footer.svelte";
	import { toast } from "@zerodevx/svelte-toast";

	const { data } = $props();
	const { friends } = data;

	function copy(username: string) {
		return async () => {
			await navigator.clipboard.writeText(username);
			toast.push("コピーしました。", {
				theme: {
					"--toastColor": "mintcream",
					"--toastBackground": "rgba(72,187,120,0.9)",
					"--toastBarBackground": "#2F855A"
				}
			});
		};
	}
</script>

<Meta
	title="フレンド募集 / Distopia.top"
	description={["Distopiaを通してフレンド募集できます。", "気軽にお使いください。"].join("")}
/>

<main>
	<div class="contents">
		<p class="title">フレンド募集</p>
		<div class="friends">
			{#each friends as friend (friend)}
				<div class="friend">
					<div class="friend-content">
						<div class="profile">
							<div>
								<img
									class="icon"
									src={friend.avatar
										? `https://cdn.discordapp.com/avatars/${friend.userId}/${friend.avatar}`
										: "/discord.webp"}
									alt=""
								/>
							</div>
							<div>
								<p class="username">
									{friend.username}
									<button onclick={copy(friend.username)}><img src="/copy.webp" alt="" /></button>
								</p>
								<p>ID: {friend.userId}</p>
							</div>
						</div>
						{#if friend.tags.length}
							<div class="tags">
								{#each friend.tags as tag (tag)}
									<div class="tag">
										<p class="content">{tag}</p>
									</div>
								{/each}
							</div>
						{/if}
						<div>
							<p>自己紹介</p>
							<pre>{friend.description}</pre>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<div class="page-control">
			<p></p>
		</div>
	</div>
</main>
<Footer />

<style>
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
	.tag .content {
		font-size: 12px;
		margin: 3px 5px;
	}
	.username {
		font-weight: 700;
		line-height: 16px;
	}
	.username img {
		cursor: pointer;
		height: 16px;
	}
	.friends {
		margin: 20px auto;
		display: grid;
		grid-template-columns: 32% 32% 32%;
		grid-template-rows: auto auto auto auto auto auto auto auto auto auto auto;
	}
	.friend {
		margin: 3px;
		border-radius: 20px;
		background-color: rgb(40, 40, 40);
	}
	.friend-content {
		overflow: hidden;
		margin: 6px 12px;
	}
	.friend-content .icon {
		height: 70px;
		border-radius: 50%;
	}
	.friend-content .profile > div {
		display: inline-block;
	}
	.friend-content > div {
		margin: 10px 0;
	}
	.contents {
		overflow: hidden;
		width: 95%;
		margin: 30px auto;
	}
	.title {
		margin-top: 14px;
		font-size: 30px;
		font-weight: 700;
	}

	main {
		min-height: 90vh;
		overflow: hidden;
	}
	p,
	pre {
		color: white;
	}
	button {
		padding: 0;
		border: none;
		outline: none;
		font: inherit;
		color: inherit;
		background: none;
	}

	@media (max-width: 1100px) {
		.friends {
			grid-template-columns: 48% 48%;
		}
	}
	@media (max-width: 800px) {
		.friends {
			grid-template-columns: 98%;
		}
	}
</style>
