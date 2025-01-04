<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/footer.svelte";

	const { data } = $props();
	const { friends, page } = data;
</script>

<Meta
	title="フレンド募集 / Distopia.top"
	description={[
		"Distopiaを通してフレンド募集できます。",
		"気軽にお使いください。",
	].join("")}
/>

<main>
	<div class="contents">
		<p class="title">フレンド募集</p>
		<div class="friends">
			{#each friends as friend}
				<div></div>
			{/each}
		</div>
	</div>
</main>
<Footer/>

<style>
	.contents {
		overflow: hidden;
		width: 95%;
		margin: 30px auto;
	}
	.title {
		margin-top: 14px;
		font-size: 30px;
		font-weight: 700;
	}

	main {
		min-height: 90vh;
		overflow: hidden;
	}
	p {
		color: white;
	}
</style>
