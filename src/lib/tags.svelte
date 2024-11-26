<script lang="ts">
	import { CHARACTER_LIMIT, TAG_COUNT_LIMIT } from "./constants.svelte";
	import { tagFormatCheck } from "$lib/tag.svelte";

	type KeyUpEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLInputElement;
	}
	type Props = {
		tags: string[]
		tagsUpdate: (params: string[]) => void
	}

	let { tags, tagsUpdate }: Props = $props();

	function controller(e: KeyUpEvent) {
		if (e.key === "Enter") {
			if (!tags.includes(e.currentTarget.value) && TAG_COUNT_LIMIT > tags.length && !tagFormatCheck(e.currentTarget.value)) {
				tags.push(e.currentTarget.value);
				e.currentTarget.value = "";
				tagsUpdate(tags);
			}
			e.preventDefault();
		}
	}

	function deleteTag(content: string) {
		return () => {
			tags = tags.filter(value => value !== content);
			tagsUpdate(tags);
		}
	}
</script>

<div>
	<input type="text" maxlength="{CHARACTER_LIMIT.tag}" onkeyup={controller}>
	<div class="tags">
		{#each tags as tag}
			<div class="tag">
				<div class="content">
					<p>{tag}</p>
					<button class="delete" onclick={deleteTag(tag)}>X</button>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	input[type="text"] {
		font-size: 20px;
		width: 50%;
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
	.tag .delete {
		cursor: pointer;
		margin: 0 0 0 2px;
		padding: 0;
		border: none;
		background-color: transparent;
		color: red;
	}
	.tag .content {
		margin: 3px 5px;
	}
</style>
