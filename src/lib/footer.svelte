<script lang="ts">
    export let fixed = false;
</script>

<main class="{ fixed ? "fixed" : "" }">
    <p>Contact: <a href="https://discord.gg/QWUxsxWyYv">Official Discord Server</a></p>
    <p>Supported by <a href="https://www.thunlights.com">Team ThunLights</a></p>
</main>

<style lang="scss">
    main {
        background-color: #212227;
    }
    main p {
        padding: 3px 5px;
        color: #9ca3af;
    }
    .fixed {
        width: 100%;
        position: fixed;
        bottom: 0;
    }
</style>
