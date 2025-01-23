<script lang="ts">
	import Meta from "$lib/meta.svelte";

	import { Toast } from "$lib/toast";
	import { onMount } from "svelte";

	const { data } = $props();

	let targetId = $state("");

	onMount(async () => {
		if (!data.canUse) {
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

<Meta
	title="危険人物を削除"
/>

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
	.context>div {
		margin-top: 20px;
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
	input {
		width: 60%;
		font-size: 15px;
		border-radius: 25px;
		padding: 4px 8px;
	}
	p {
		color: white;
	}
</style>
