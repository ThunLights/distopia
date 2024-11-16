<script lang="ts">
    import { LOGIN_URL } from "$lib/constants";

    import "@fontsource/inter/900.css";
    import "@fontsource/open-sans/800-italic.css";

    import type { ResponseContent } from "$lib/api/auth/index";

    type UserData = ResponseContent | null;

    export let title = "Distopia";
    export let titleLink = "/";
    export let userData: UserData = null;
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
        {#if !userData}
            <div class="discord-login">
                <a href="{LOGIN_URL}">
                    <div class="login-block">
                        <p class="discord-login-content inline">Login</p>
                    </div>
                </a>
            </div>
        {:else}
            <div class="discord-profile">
                <img src="{userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.webp` : "/discord.webp"}" alt="">
                <p>{userData.username}</p>
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
    }
    .discord-login-content {
        font-family: "Inter";
        margin: auto 0;
        line-height: var(--discord-login-height);
    }
    .discord-profile, .discord-login {
        margin: auto 20px auto 0;
    }
    .discord-profile {
        display: flex;
    }
    .discord-profile img {
        border-radius: 25px;
        height: 25px;
        margin: 0;
        padding: 0;
        overflow: hidden;
        position: relative;
    }
    .discord-profile p {
        line-height: 25px;
        margin: 0 0 0 5px;
        padding: 0;
    }
    div {
        display: inline-block;
    }
    p, a {
        text-decoration: none;
        color: white;
    }
</style>