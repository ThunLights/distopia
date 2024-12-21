<script lang="ts">
    import { DISCORD_INVITE_LINK } from "$lib/invite.svelte";

    export let fixed = false;
</script>

<main class="{ fixed ? "fixed" : "" }">
    <p>Contact: <a href="{DISCORD_INVITE_LINK}">Official Discord Server</a></p>
    <p>Supported by <a href="https://www.thunlights.com">Team ThunLights</a></p>
</main>

<style>
    main {
        background-color: #212227;
    }
    main p {
        padding: 3px 5px;
        color: #9ca3af;
    }
	a {
		color: rgb(140, 25, 222);
	}
    .fixed {
        width: 100%;
        position: fixed;
        bottom: 0;
    }
</style>
