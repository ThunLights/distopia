<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Main from "$lib/components/main.svelte";

	import { onMount } from "svelte";

	import type { ResponseJson } from "$routes/api/events/list/+server";

	let events = $state<ResponseJson["post"]["content"]>([]);

	onMount(async () => {});
</script>

<Meta title="イベント一覧" />

<Main>
	<p class="title">イベント一覧</p>

	<div class="events">
		{#if events.length}
			{#each events as event}
				<div class="event"></div>
			{/each}
		{:else}
			<p>現在イベントは実行されていません</p>
		{/if}
	</div>
</Main>

<style>
</style>
