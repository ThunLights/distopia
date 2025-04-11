<script lang="ts">
	import "../app.css";
	import Header from "$lib/components/header.svelte";

	import { SvelteToast } from "@zerodevx/svelte-toast";

	const { data, children } = $props();
	const { auth, isMobile } = data;
</script>

<svelte:head>
	{#if !isMobile}
		<script
			async
			src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9010324670720699"
			crossorigin="anonymous"
		></script>
	{/if}
</svelte:head>

<SvelteToast />

<Header userData={auth} />
{@render children()}
