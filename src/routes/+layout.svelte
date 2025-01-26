<script lang="ts">
	import "../app.css";
	import Header from "$lib/header.svelte";

	import { SvelteToast } from "@zerodevx/svelte-toast";
	import { headerStore } from "$lib/stores";
	import { onMount } from "svelte";

	const { data, children } = $props();
	const { auth, adsense } = data;
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

<svelte:head>
	{#if !adsense}
		<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9010324670720699" crossorigin="anonymous"></script>
	{/if}
</svelte:head>

<SvelteToast />

<Header userData={auth} {loginBlock} />
{@render children()}
