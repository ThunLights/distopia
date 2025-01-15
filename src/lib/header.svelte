<script lang="ts">
    import { LOGIN_URL } from "$lib/constants";

    import "@fontsource/inter/900.css";
    import "@fontsource/open-sans/800-italic.css";

    import type { ResponseContent } from "$routes/api/auth/+server";

    type UserData = ResponseContent | null;
	type Props = {
		title?: string
		titleLink?: string
		loginBlock?: boolean
		userData?: UserData
	}

	const props: Props = $props();
	const title = props.title ?? "Distopia";
	const titleLink = props.titleLink ?? "/";
	const loginBlock = props.loginBlock ?? true;
	const userData = props.userData ?? null;

	let showBagerContent = $state(false);

	function bagerSwitcher() {
		showBagerContent = !showBagerContent;
	}
</script>

<header>
    <div>
		<div class="bager">
			<input id="drawer_input" class="drawer_hidden hidden" type="checkbox" onchange={bagerSwitcher}>
			<label for="drawer_input" class="drawer_open"><span></span></label>
		</div>
		<nav class="bager-content">
			<div class="header-title">
				<a href="{titleLink}">
					<p>{title}</p>
				</a>
			</div>
			<div class="header-other" style="display: {showBagerContent ? "block" : "none"};">
				<a href="/">
					<p class="header-other-content">ホーム</p>
				</a>
			</div>
			<div class="header-other" style="{showBagerContent ? "display: block;" : ""}">
				<a href="/ranking">
					<p class="header-other-content">ランキング</p>
				</a>
			</div>
			<div class="header-other" style="{showBagerContent ? "display: block;" : ""}">
				<a href="/people">
					<p class="header-other-content">危険人物一覧</p>
				</a>
			</div>
			<div class="header-other" style="{showBagerContent ? "display: block;" : ""}">
				<a href="/friends">
					<p class="header-other-content">フレンド募集</p>
				</a>
			</div>
			<div class="header-other" style="{showBagerContent ? "display: block;" : ""}">
				<a href="/help">
					<p class="header-other-content">ヘルプ</p>
				</a>
			</div>
			<div class="header-other" style="{showBagerContent ? "display: block;" : ""}">
				<a href="/other">
					<p class="header-other-content">その他</p>
				</a>
			</div>
		</nav>
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
	#drawer_input:checked ~ .drawer_open span {
		background: rgba(255, 255, 255, 0);
	}
	#drawer_input:checked ~ .drawer_open span::before {
		bottom: 0;
		transform: rotate(45deg);
	}
	#drawer_input:checked ~ .drawer_open span::after {
		top: 0;
		transform: rotate(-45deg);
	}
	.drawer_open {
		display: flex;
		height: 60px;
		width: 60px;
		justify-content: center;
		align-items: center;
		position: relative;
		z-index: 100;
		cursor: pointer;
	}
	.drawer_open span,
	.drawer_open span:before,
	.drawer_open span:after {
		content: '';
		display: block;
		height: 3px;
		width: 25px;
		border-radius: 3px;
		background: white;
		transition: 0.5s;
		position: absolute;
	}
	.drawer_open span:before {
		bottom: 8px;
	}
	.drawer_open span:after {
		top: 8px;
	}
	.bager {
		display: none;
	}

	.hidden {
		display: none;
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
		user-select: none;
        font-family: "Inter";
    }
    .header-other {
        margin-right: 12px;
    }
	.header-other-content {
		font-weight: 700;
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
    @media (max-width: 840px) {
		.bager {
			display: block;
		}
		.bager-content {
			position: fixed;
			z-index: 20;
			opacity: 0.85;
			background: #282828;
			transition: .5s;
		}
		.header-other-content {
			padding: 6px 10px;
			font-size: 18px;
		}
		.header-other {
			display: none;
		}
		.header-title {
			display: none;
		}
	}
	@media (max-width: 650px) {
		.discord-logined-content,
		.discord-login-content {
			font-size: 14px;
		}
	}
	@media (max-width: 540px) {
		.discord-logined-content,
		.discord-login-content {
			font-size: 12px;
		}
	}
</style>