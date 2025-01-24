<script lang="ts">
	import Tags from "./tags.svelte";

	import { DangerousPeople } from "./dangerousPeople";

	import { DangerousPeopleTypes } from "./constants";

	export type Content = {
		targetId: string
		name: string
		score: string[]
		tags: string[]
		title: string
		description: string
		targetType: typeof DangerousPeopleTypes[number]
	}

	export type Props = {
		send: (content: Content) => void
		page: {
			title: string
			button: string
		},
		init: Partial<Content>,
		canEditId?: boolean
	};

	const { send, page, init, canEditId }: Props = $props();

	let targetId = $state(init.targetId ?? "");
	let name = $state(init.name ?? "");
	let score = $state<string[]>(init.score ?? []);
	let tags = $state<string[]>(init.tags ?? []);
	let title = $state(init.title ?? "");
	let description = $state(init.description ?? "");
	let targetType = $state<typeof DangerousPeopleTypes[number]>(init.targetType ?? "criminal");
	let scoreSum = $state(DangerousPeople.strArrToScore(init.score ?? []));

	function clicked() {
		send({ targetId, name, score, tags, title, description, targetType });
	}
</script>

<div>
	<p class="title">{page.title}</p>
</div>
<div>
	<p>ユーザーID</p>
	<input type="text" readonly={canEditId} bind:value={targetId}>
</div>
<div>
	<p>通称</p>
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
						<input type="checkbox" checked={score.includes(element.id)} onchange={e => {
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
	<button onclick={clicked}>{page.button}</button>
</div>

<style>
	.title {
		font-size: 20px;
		margin: 10px 0;
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
