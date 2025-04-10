<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import People from "$lib/people.svelte";

	import { Toast } from "$lib/toast";
	import { DangerousPeopleTypes } from "$lib/constants";
	import { onMount } from "svelte";

	import type { ResponseJson } from "$routes/api/people/+server";

	type Content = {
		targetId: string;
		name: string;
		score: string[];
		tags: string[];
		title: string;
		description: string;
		targetType: (typeof DangerousPeopleTypes)[number];
		subAccounts: string[];
	};
	type DangerousPeopleType = (typeof DangerousPeopleTypes)[number];

	const { data } = $props();

	let userData = $state<ResponseJson | null>(null);
	let targetId = $state("");
	let userType = $derived<DangerousPeopleType>(
		userData && DangerousPeopleTypes.includes(userData.user.type as DangerousPeopleType)
			? (userData.user.type as DangerousPeopleType)
			: "criminal"
	);

	onMount(async () => {
		if (!data.canUse) {
			return (location.href = "/");
		}
	});

	async function getUser() {
		const response = await fetch("/api/people", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				userId: targetId
			})
		});

		if (response.status === 200) {
			userData = await response.json();
		} else if (response.status === 404) {
			Toast.error("ユーザーが見つかりませんでした。");
		} else {
			Toast.error("エラー");
		}
	}

	async function send(content: Content) {
		if (!data.auth) {
			Toast.error("認証情報エラー");
			return;
		}
		const { targetId, targetType, tags, name, score, title, description, subAccounts } = content;
		const response = await fetch("/admin/api/people", {
			method: "POST",
			headers: {
				Authorization: data.auth.token,
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				userId: targetId,
				type: targetType,

				name,
				score,
				title,
				description,
				tags,
				subAccounts
			})
		});
		if (response.ok) {
			Toast.success(`${targetId}を追加しました。`);
			location.reload();
		} else {
			try {
				const json = await response.json();
				Toast.error(`レスポンス「${json.content}」`);
			} catch {
				Toast.error("エラー");
			}
		}
	}
</script>

<Meta title="危険人物を編集" />

<main>
	<div class="contents">
		<div class="context">
			{#if userData}
				<People
					{send}
					canEditId={true}
					page={{
						title: "危険人物を編集",
						button: "編集"
					}}
					init={userData
						? {
								targetId: userData.userId,
								name: userData.user.name,
								score: userData.score,
								tags: userData.tags,
								title: userData.user.title,
								description: userData.user.description,
								targetType: userType,
								subAccounts: userData.subAccounts
							}
						: {}}
				/>
			{:else}
				<div>
					<p>どのIDのユーザーを更新？</p>
				</div>
				<div>
					<input type="text" bind:value={targetId} />
				</div>
				<div>
					<button onclick={getUser}>取得</button>
				</div>
			{/if}
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
	.context > div {
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
