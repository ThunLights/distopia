<script lang="ts">
	import Meta from "$lib/components/meta.svelte";

	import { createRedirectEvent } from "$lib/client/redirect.js";
	import { onMount } from "svelte";

	const { data } = $props();

	onMount(async () => {
		if (!data.canUse) {
			return (location.href = "/");
		}
	});
</script>

<Meta title="危険人物関係" />

<main>
	<div class="contents">
		<div class="context">
			<div>
				<p>どのような操作をしますか？</p>
			</div>
			<div>
				<button onclick={createRedirectEvent("/admin/people/add")}>追加</button>
				<button onclick={createRedirectEvent("/admin/people/update")}>更新</button>
				<button onclick={createRedirectEvent("/admin/people/remove")}>削除</button>
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
