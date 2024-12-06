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
                <p class="header-other-content">About</p>
            </a>
        </div>
        <div class="header-other">
            <a href="/supporters">
                <p class="header-other-content">Supporters</p>
            </a>
        </div>
        <div class="header-other">
            <a href="/staff">
                <p class="header-other-content">Staff</p>
            </a>
        </div>
        <div class="header-other">
            <a href="/ranking">
                <p class="header-other-content">Ranking</p>
            </a>
        </div>
        <div class="header-other">
            <a href="/help">
                <p class="header-other-content">Help</p>
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
                        <p class="discord-logined-content">{userData.username}</p>
                    </div>
                </a>
            {/if}
        </div>
    {/if}
</header>

<style>
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
	.discord-logined-content,
    .discord-login-content {
        font-family: "Inter";
        margin: auto 0;
		font-size: 16px;
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
    @media (max-width: 800px) {
		.header-other-content {
			font-size: 14px;
		}
		.header-title {
			font-size: 24px;
		}
	}
	@media (max-width: 650px) {
		.header-other-content {
			font-size: 10px;
		}
		.header-title {
			font-size: 20px;
		}
		.discord-logined-content,
		.discord-login-content {
			font-size: 14px;
		}
	}
	@media (max-width: 540px) {
		.header-other-content {
			font-size: 10px;
		}
		.header-title {
			font-size: 16px;
		}
		.discord-logined-content,
		.discord-login-content {
			font-size: 12px;
		}
	}
	@media (max-width: 500px) {
		.header-other-content {
			font-size: 8px;
		}
		.header-title {
			font-size: 12px;
		}
		.discord-logined-content,
		.discord-login-content {
			font-size: 8px;
		}
	}
	@media (max-width: 480px) {
		.header-other-content {
			font-size: 6px;
		}
		.header-title {
			font-size: 10px;
		}
	}
	@media (max-width: 450px) {
		.header-other-content {
			font-size: 4px;
		}
		.header-title {
			font-size: 8px;
		}
	}
</style>