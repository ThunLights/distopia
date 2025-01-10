<script lang="ts">
	import { PUBLIC_OWNER_ID } from "$env/static/public";
	import { Toast } from "$lib/toast";
	import { onMount } from "svelte";

	const { data } = $props();

	let targetId = $state("");

	onMount(async () => {
		if (!(data.auth && data.auth.id === PUBLIC_OWNER_ID)) {
			return location.href = "/";
		}
	});

	async function send() {
		if (!data.auth) {
			Toast.error("認証情報エラー")
			return;
		}
		const response = await fetch(`/admin/api/people/${targetId}`, {
			method: "DELETE",
			headers: {
				Authorization: data.auth.token,
			}
		});
		if (response.ok) {
			Toast.success(`${targetId}を削除しました。`)
		} else {
			try {
				const json = await response.json();
				Toast.error(`レスポンス「${json.content}」`)
			} catch {
				Toast.error("エラー")
			}
		}
		targetId = "";
	}
</script>

<main>
	<div class="contents">
		<div class="context">
			<div>
				<p>どのIDを消去しますか？</p>
			</div>
			<div>
				<input type="text" bind:value={targetId}>
			</div>
			<div>
				<button onclick={send}>削除</button>
			</div>
		</div>
	</div>
</main>

<style>
	main {
		min-height: 90vh;
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

	p {
		color: white;
	}
</style>
