<script lang="ts">
    import { LOGIN_URL } from "$lib/constants.svelte";

    import "@fontsource/inter/900.css";
    import "@fontsource/open-sans/800-italic.css";

    import type { ResponseContent } from "$routes/api/auth/+server";

    type UserData = ResponseContent | null;

    export let title = "Distopia";
    export let titleLink = "/";
    export let loginBlock = true;
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
        <div class="header-other">
            <a href="/supporters">
                <p>Supporters</p>
            </a>
        </div>
        <div class="header-other">
            <a href="/staff">
                <p>Staff</p>
            </a>
        </div>
        <div class="header-other">
            <a href="/ranking">
                <p>Ranking</p>
            </a>
        </div>
    </div>
    {#if loginBlock}
        <div>
            {#if userData === null}
                <div class="discord-login">
                    <a href="{LOGIN_URL}">
                        <div class="login-block">
                            <p class="discord-login-content inline">Login</p>
                        </div>
                    </a>
                </div>
            {:else}
                <a href="/account">
                    <div class="discord-profile">
                        <img src="{userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.webp` : "/discord.webp"}" alt="">
                        <p>{userData.username}</p>
                    </div>
                </a>
            {/if}
        </div>
    {/if}
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
    .header-other {
        margin-right: 12px;
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
        cursor: pointer;
        display: flex;
        padding: 3px 6px;
    }
    .discord-profile:hover {
        border-radius: 25px;
        background-color: rgb(107, 107, 107);
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