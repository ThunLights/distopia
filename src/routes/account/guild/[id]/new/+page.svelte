<script lang="ts">
    import Meta from "$lib/meta.svelte";
    import Footer from "$lib/footer.svelte";
	import Guild from "$lib/guild.svelte";

    import { onMount } from "svelte";
    import { getTmpGuild, GuildsApiError } from "$lib/guilds.svelte";

    import type { PageData } from "./$types";

	type TmpGuild = {
		guildId: string;
		name: string;
		invite: string;
		icon: string | null;
		banner: string | null;
	}

    const { data }: { data: PageData } = $props();
    const { guildId } = data;
    const loginData = $state(data.auth);
	let tmpGuild = $state<TmpGuild | null>(null);
    let title = $state("Loading...");

	function updateSettings() {
		if (tmpGuild) {
			title = `「${tmpGuild.name}」を本登録する。`;
		}
	}

    onMount(async () => {
        if (!loginData) {
            return location.href = "/";
        }
        const response = await getTmpGuild(loginData.token, guildId);
		if (response instanceof GuildsApiError) {
			return location.href = "/account";
		}
		tmpGuild = response;
		updateSettings();
    })
</script>

<Meta title={title}/>

<main>
	{#if tmpGuild}
		<Guild
			token={data.auth ? data.auth.token : ""}
			method={"POST"}
			guild={{...tmpGuild, ...{ description: "", category: "other", tags: [], nsfw: false }}}
		/>
	{/if}
</main>
<Footer/>

<style>
</style>
