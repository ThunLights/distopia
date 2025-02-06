<script lang="ts">
	import Meta from "$lib/meta.svelte";

	import { onMount } from "svelte";

	const { data } = $props();

	onMount(async () => {});
</script>

<Meta
	title="イベントブーストを設定"
/>

<main>
	<div class="contents">
		<div class="context">
			<p class="title">イベントブーストを設定する</p>
		</div>
	</div>
</main>

<style>
	.contents {
		margin: 10px 20px;
		overflow: hidden;
	}
	.context {
		margin: 6px 10px;
		overflow: hidden;
	}
	p {
		color: white;
	}
</style>
