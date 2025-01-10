<script lang="ts">
	import Footer from "$lib/footer.svelte";

	import { onMount } from "svelte";

	const { data } = $props();
	const { userId, user } = data;

	onMount(async () => {})
</script>

<main>
	<div class="contents">
		<div class="context">
			{#if user}
				<div></div>
			{:else}
				<p class="title center">見つかりませんでした。</p>
			{/if}
		</div>
	</div>
</main>
<Footer></Footer>

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
		font-size: 26px;
	}
	.center {
		text-align: center;
	}

	p {
		color: white;
	}
</style>
