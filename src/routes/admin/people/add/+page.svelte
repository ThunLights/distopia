<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Tags from "$lib/tags.svelte";

	import { PUBLIC_OWNER_ID } from "$env/static/public";
	import { Toast } from "$lib/toast";
	import { onMount } from "svelte";
	import { DangerousPeopleTypes } from "$lib/constants";
	import { DangerousPeople } from "$lib/dangerousPeople";
	import { discord } from "$lib/server/discord";

	const { data } = $props();

	let targetId = $state("");
	let name = $state("");
	let score = $state<string[]>([]);
	let tags = $state<string[]>([]);
	let title = $state("");
	let description = $state("");
	let targetType = $state<typeof DangerousPeopleTypes[number]>("criminal");
	let scoreSum = $state(0);

	onMount(async () => {
		if (!(
			data.auth
			&& (
				data.auth.id === PUBLIC_OWNER_ID
				|| await discord.bot.control.guild.isHonoraryMember(data.auth.id)
			)
		)) {
			return location.href = "/";
		}
	});

	async function send() {
		if (!data.auth) {
			Toast.error("認証情報エラー")
			return;
		}
		const response = await fetch("/admin/api/people", {
			method: "POST",
			headers: {
				Authorization: data.auth.token,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				userId: targetId,
				type: targetType,

				name,
				score,
				title,
				description,
				tags,
			})
		});
		if (response.ok) {
			Toast.success(`${targetId}を追加しました。`)
			targetId = "";
			name = "";
			score = [];
			title = "";
			description = "";
			tags = [];
		} else {
			try {
				const json = await response.json();
				Toast.error(`レスポンス「${json.content}」`)
			} catch {
				Toast.error("エラー")
			}
		}
	}
</script>

<Meta
	title="危険人物を追加"
/>

<main>
	<div class="contents">
		<div class="context">
			<div>
				<p class="title">危険人物リストに追加</p>
			</div>
			<div>
				<p>ユーザーID</p>
				<input type="text" bind:value={targetId}>
			</div>
			<div>
				<p>名前</p>
				<input type="text" bind:value={name}>
			</div>
			<div>
				<p>スコア (現在の合計: {scoreSum})</p>
				<table>
					<thead></thead>
					<tbody>
						{#each DangerousPeople.elementsList() as element}
							<tr class="score-element">
								<th>
									<input type="checkbox" onchange={e => {
										if (e.currentTarget.checked) {
											score.push(element.id);
											scoreSum += element.score;
										} else {
											score = score.filter(value => value !== element.id);
											scoreSum -= element.score;
										}
									}} />
								</th>
								<td><p>{element.label}</p></td>
								<td><p>{element.score}</p></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div>
				<p>危険タイプ</p>
				<select bind:value={targetType} onchange={e => {
					const value = e.currentTarget.value as typeof DangerousPeopleTypes[number];
					targetType = DangerousPeopleTypes.includes(value) ? value : "criminal";
				}}>
					{#each DangerousPeopleTypes as type}
						<option value={type}>{type}</option>
					{/each}
				</select>
			</div>
			<div>
				<p>タグ</p>
				<Tags
					tags={tags}
					tagsUpdate={(newTags) => { tags = newTags }}
				/>
			</div>
			<div>
				<p>理由 (簡潔)</p>
				<input type="text" bind:value={title}>
			</div>
			<div>
				<p>説明</p>
				<textarea bind:value={description}></textarea>
			</div>
			<div>
				<button onclick={send}>追加</button>
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
	.title {
		font-size: 20px;
		margin: 10px 0;
	}
	.context>div {
		margin-top: 16px;
	}

	textarea {
		resize: vertical;
		width: 95%;
		height: 20vh;
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
	input[type="text"] {
		width: 60%;
		font-size: 15px;
		border-radius: 25px;
		padding: 4px 8px;
	}
	p {
		color: white;
	}
</style>
