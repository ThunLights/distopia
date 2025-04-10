<script lang="ts">
	import Meta from "$lib/meta.svelte";
	import Footer from "$lib/footer.svelte";
	import Guild from "$lib/guild.svelte";

	import { onMount } from "svelte";
	import { getPublicGuild, GuildsApiError } from "$lib/guilds.svelte";

	import type { PageData } from "./$types";
	import type { Response } from "$routes/api/guilds/public/[id]/+server";

	const { data }: { data: PageData } = $props();
	const { guildId } = data;
	let guild = $state<Response | null>(null);

	onMount(async () => {
		if (!data.auth) {
			return (location.href = "/account");
		}
		const response = await getPublicGuild(data.auth.token, guildId);
		if (response instanceof GuildsApiError) {
			return (location.href = "/account");
		}
		guild = response;
	});
</script>

<Meta />

<main>
	{#if guild}
		<Guild token={data.auth ? data.auth.token : ""} method="PATCH" {guild} />
	{/if}
</main>
<Footer />

<style></style>
