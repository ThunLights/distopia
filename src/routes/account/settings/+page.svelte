<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import Footer from "$lib/components/footer.svelte";

	import { onMount } from "svelte";
	import { toast } from "@zerodevx/svelte-toast";

	import type { PageData } from "./$types";

	const { data }: { data: PageData } = $props();
	let loginData = $state(data.auth);

	onMount(async () => {
		if (!loginData) {
			return (location.href = "/");
		}
	});

	async function resetToken() {
		if (!loginData) return;
		const response = await fetch("/api/auth/revoke", {
			method: "DELETE",
			headers: {
				Authorization: loginData.token,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({})
		});
		if (response.ok) {
			location.href = "/";
		} else {
			const json = await response.json();
			toast.push(`ERROR: ${json.content}`, {
				theme: {
					"--toastBackground": "rgb(168, 13, 13)"
				}
			});
		}
	}
</script>

<Meta />

<main>
	<div class="main-div">
		{#if loginData}
			<div class="profile">
				<div class="profile-contents">
					{#if loginData.avatar}
						<div class="profile-content">
							<img
								class="icon"
								src="https://cdn.discordapp.com/avatars/{loginData.id}/{loginData.avatar}.webp"
								alt=""
							/>
						</div>
					{/if}
					<div class="profile-content">
						<p class="profile-title">「 {loginData.username} 」でログイン中</p>
						<p>ID: {loginData.id}</p>
						{#if loginData.email}
							<p>メールアドレス: {loginData.email}</p>
						{/if}
					</div>
				</div>
			</div>
			<div class="contents">
				<div>
					<p class="title">コントロール</p>
					<div>
						<button class="account-operation-btn" onclick={resetToken}
							>全てのデバイスからログアウト</button
						>
					</div>
				</div>
			</div>
		{:else}
			<div class="contents">
				<p>上手くデータが読み込まれませんでした</p>
				<p>再ロードしてください</p>
			</div>
		{/if}
	</div>
</main>
<Footer />

<style>
	.account-operation-btn {
		cursor: pointer;
		border-radius: 25px;
		color: white;
		background-color: rgb(49, 49, 49);
		opacity: 0.8;
		padding: 3px 6px;
		border: 1px solid rgb(85, 85, 85);
	}
	.account-operation-btn:active {
		border: 1px solid rgb(49, 49, 49);
		background-color: rgb(85, 85, 85);
	}
	.profile-contents {
		margin: 25px 10px;
	}
	.profile-content {
		display: inline-block;
		margin-right: 12px;
	}
	.profile-title {
		font-size: 18px;
		margin-bottom: 5px;
	}
	.profile {
		overflow: hidden;
		background-color: rgb(40, 40, 40);
	}
	.profile .icon {
		border-radius: 50%;
	}
	.contents .title {
		font-size: 20px;
		padding: 5px 3px;
		border-bottom: solid 1px gray;
		margin-bottom: 10px;
	}
	.contents {
		overflow: hidden;
		display: block;
		background-color: rgb(37, 36, 41);
		border-radius: 10px;
		width: 90%;
		margin: 20px auto;
	}
	.contents > div {
		padding: 5px 10px;
	}
	.main-div {
		min-height: 90vh;
	}
	p {
		text-decoration: none;
		color: white;
	}
</style>
