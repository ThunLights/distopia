<script lang="ts">
	import { PUBLIC_OWNER_ID } from "$env/static/public";
	import { onMount } from "svelte";

	const { data } = $props();

	onMount(async () => {
		if (!(data.auth && data.auth.id === PUBLIC_OWNER_ID)) {
			return location.href = "/";
		}
	})
</script>

<main>
	<div class="contents">
		<div class="context">
			<div>
				<p>どのような操作をしますか？</p>
			</div>
			<div>
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

	p {
		color: white;
	}
</style>
