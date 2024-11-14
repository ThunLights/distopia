<script lang="ts">
    import { LoginUrl } from "./constants";

    import "@fontsource/inter/900.css";
    import "@fontsource/open-sans/800-italic.css";

    export let title = "Distopia";
    export let titleLink = "/";
    export let loginPanel = true;
</script>

<header>
    <div>
        <div class="header-title">
            <a href="{titleLink}">
                <p>{title}</p>
            </a>
        </div>
        <div class="header-other">
            <a href="/about">
                <p>About</p>
            </a>
        </div>
    </div>
    <div>
        {#if loginPanel}
            <div class="discord-login">
                <a href="{LoginUrl}">
                    <div class="login-block">
                        <p class="discord-login-content inline">Login</p>
                    </div>
                </a>
            </div>
        {/if}
    </div>
</header>

<style>
    :root {
        --discord-login-height: 25px;
    }
    header {
        display: grid;
        grid-template-columns: 1fr auto;
        background-color: rgb(41,39,50);
        align-items: center;
        position: sticky;
        top: 0;
        z-index: 1;
        width: 100%;
    }
    .header-title p,
    .header-other {
        font-family: "Inter";
    }
    .header-title {
        font-size: 30px;
        padding: 20px;
    }
    .inline {
        display: inline-block;
    }
    .login-block {
        display: block;
    }
    .discord-login {
        padding: 5px 15px;
        border-radius: 25px;
        background-color: #5865F2;
        margin: auto 20px auto 0;
    }
    .discord-login-content {
        font-family: "Inter";
        margin: auto 0;
        line-height: var(--discord-login-height);
    }
    div {
        display: inline-block;
    }
    a {
        text-decoration: none;
        color: white;
    }
</style>