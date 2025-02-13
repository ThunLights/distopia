<script lang="ts">
	const { children } = $props();
</script>

<main>
	<div class="contents">
		<div class="context">
			{@render children()}
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
</style>
