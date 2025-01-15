<script lang="ts">
    import { DISCORD_INVITE_LINK } from "$lib/invite";

    export let fixed = false;
</script>

<footer class="{ fixed ? "fixed" : "" }">
    <p>Contact: <a href="{DISCORD_INVITE_LINK}">Official Discord Server</a></p>
    <p>Supported by <a href="https://www.thunlights.com">Team ThunLights</a></p>
</footer>

<style>
	footer {
        background-color: #212227;
    }
	footer p {
        padding: 3px 5px;
        color: #9ca3af;
    }
	a {
		color: rgb(88, 212, 228);
	}
    .fixed {
        width: 100%;
        position: fixed;
        bottom: 0;
    }
</style>
