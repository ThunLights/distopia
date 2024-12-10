<script lang="ts">
	import "../app.css";
	import Header from "$lib/header.svelte";

	import { SvelteToast } from "@zerodevx/svelte-toast";
	import { headerStore } from "$lib/stores";
	import { onMount } from "svelte";

	const { data, children } = $props();
	const { auth } = data;
	let loginBlock = $state(true);

	onMount(() => {
		headerStore.set({
			loginBlock: true,
		});
	});

	headerStore.subscribe((value) => {
		loginBlock = value.loginBlock;
	});
</script>

<SvelteToast />

<Header userData={auth} {loginBlock} />
{@render children()}
