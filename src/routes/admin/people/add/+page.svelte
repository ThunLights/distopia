<script lang="ts">
	import Meta from "$lib/components/meta.svelte";
	import People from "$lib/people.svelte";

	import { Toast } from "$lib/toast";
	import { onMount } from "svelte";

	import type { DangerousPeopleTypes } from "$lib/constants";

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

	const { data } = $props();

	onMount(async () => {
		if (!data.canUse) {
			return (location.href = "/");
		}
	});

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

<Meta title="危険人物を追加" />

<main>
	<div class="contents">
		<div class="context">
			<People
				{send}
				page={{
					title: "危険人物リストに追加",
					button: "追加"
				}}
				init={{}}
			/>
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
</style>
