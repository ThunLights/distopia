<script lang="ts">
  /* eslint svelte/no-navigation-without-resolve: "off" */
  import DiscordIcon from "#lib/assets/icon/discord.webp";
  import type { UserAuth } from "#lib/shared/types/UserAuth.js";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import type { ResolvedPathname } from "$app/types";
  import "@fontsource/inter/900.css";
  import "@fontsource/open-sans/800-italic.css";
  import { prefersReducedMotion } from "svelte/motion";
  import { MediaQuery } from "svelte/reactivity";
  import { fade, fly } from "svelte/transition";

  type Props = {
    title?: string;
    titleLink?: ResolvedPathname;
    loginBlock?: boolean;
    userData?: UserAuth | null;
  };

  const {
    title = "Distopia",
    titleLink = "/",
    loginBlock = true,
    userData = null,
  }: Props = $props();

  const links = [
    { href: resolve("ranking"), label: "ランキング" },
    { href: resolve("guilds/tags"), label: "サーバータグ" },
    { href: resolve("friends"), label: "フレンド募集" },
    { href: "https://docs.distopia.top", label: "ヘルプ", external: true },
    { href: resolve("other"), label: "その他" },
  ];

  let open = $state(false);
  let menuButton = $state<HTMLButtonElement>();
  const duration = $derived(prefersReducedMotion.current ? 0 : 250);
  // Must match the 840px breakpoint in <style>.
  const mobile = new MediaQuery("max-width: 840px");

  // Rotating/resizing to desktop hides the toggle; close so the scroll lock is released.
  $effect(() => {
    if (!mobile.current) open = false;
  });

  // SSR renders resolve() as a relative path ("./ranking"), so compare resolved pathnames.
  function isCurrent(href: string) {
    const target = new URL(href, page.url.href);
    return target.origin === page.url.origin && page.url.pathname.startsWith(target.pathname);
  }

  function close() {
    open = false;
  }

  $effect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  });
</script>

<svelte:window
  onkeydown={(e) => {
    if (open && e.key === "Escape") {
      close();
      menuButton?.focus();
    }
  }}
/>

<header class:menu-open={open}>
  <button
    bind:this={menuButton}
    class="menu-button"
    class:open
    type="button"
    aria-label={open ? "メニューを閉じる" : "メニューを開く"}
    aria-expanded={open}
    aria-controls="mobile-menu"
    onclick={() => (open = !open)}
  >
    <span></span>
  </button>

  <a class="brand" href={titleLink}>{title}</a>

  <nav class="desktop-nav" aria-label="メイン">
    {#each links as link (link.href)}
      <a href={link.href} aria-current={isCurrent(link.href) ? "page" : undefined}>{link.label}</a>
    {/each}
  </nav>

  {#if loginBlock}
    {#if userData === null}
      <a class="login" href={resolve("login")} rel="external">Login</a>
    {:else}
      <a class="profile" href={resolve("user")}>
        <img src={userData.avatarUrl ?? DiscordIcon} alt="" />
        <span>{userData.username}</span>
      </a>
    {/if}
  {/if}
</header>

{#if open}
  <button
    class="backdrop"
    type="button"
    tabindex="-1"
    aria-label="メニューを閉じる"
    onclick={close}
    transition:fade={{ duration }}
  ></button>
  <nav
    id="mobile-menu"
    class="drawer"
    aria-label="メニュー"
    transition:fly={{ x: -280, duration, opacity: 1 }}
  >
    <a
      href={resolve("/")}
      onclick={close}
      aria-current={page.url.pathname === "/" ? "page" : undefined}>ホーム</a
    >
    {#each links as link (link.href)}
      <a
        href={link.href}
        onclick={close}
        aria-current={isCurrent(link.href) ? "page" : undefined}
        rel={link.external ? "external" : undefined}>{link.label}</a
      >
    {/each}
  </nav>
{/if}

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 24px;
    height: 64px;
    padding: 0 20px;
    background-color: var(--surface-color);
    border-bottom: 1px solid rgb(66, 66, 66);
    font-family: "Inter", sans-serif;
  }
  a {
    color: white;
    text-decoration: none;
  }
  .brand {
    font-size: 30px;
    font-weight: 900;
    letter-spacing: -0.02em;
    user-select: none;
  }

  .desktop-nav {
    display: flex;
    gap: 4px;
    margin-right: auto;
  }
  .desktop-nav a {
    position: relative;
    padding: 8px 12px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 16px;
    color: rgb(207, 207, 207);
    transition: color 0.15s;
  }
  .desktop-nav a:hover,
  .desktop-nav a:focus-visible {
    color: white;
    background-color: var(--body-background-color);
  }
  .desktop-nav a[aria-current="page"] {
    color: white;
  }
  /* The thick-over-thin double rule echoes the banner logo's underline and h1's border. */
  .desktop-nav a[aria-current="page"]::after {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 0;
    height: 2px;
    border-top: 3px solid white;
    border-bottom: 1px solid white;
  }

  .login {
    padding: 8px 18px;
    border-radius: 25px;
    background-color: #5865f2;
    font-weight: 700;
    font-size: 16px;
    white-space: nowrap;
    transition: background-color 0.15s;
  }
  .login:hover {
    background-color: #4752c4;
  }
  .profile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px 4px 4px;
    border-radius: 999px;
    max-width: 220px;
    transition: background-color 0.2s;
  }
  .profile:hover {
    background-color: var(--body-background-color);
  }
  .profile img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }
  .profile span {
    font-weight: 700;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .menu-button {
    display: none;
    position: relative;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 8px;
    background: none;
    cursor: pointer;
  }
  .menu-button:hover {
    background-color: var(--body-background-color);
  }
  .menu-button span,
  .menu-button span::before,
  .menu-button span::after {
    position: absolute;
    left: 50%;
    width: 22px;
    height: 2px;
    margin-left: -11px;
    border-radius: 2px;
    background-color: white;
    transition:
      transform 0.25s,
      background-color 0.25s;
  }
  .menu-button span {
    top: 50%;
    margin-top: -1px;
  }
  .menu-button span::before,
  .menu-button span::after {
    content: "";
    left: 0;
    margin-left: 0;
  }
  .menu-button span::before {
    transform: translateY(-7px);
  }
  .menu-button span::after {
    transform: translateY(7px);
  }
  .menu-button.open span {
    background-color: transparent;
  }
  .menu-button.open span::before {
    transform: rotate(45deg);
  }
  .menu-button.open span::after {
    transform: rotate(-45deg);
  }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    border: none;
    background-color: rgb(0 0 0 / 50%);
  }
  .drawer {
    overflow-y: auto;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    width: min(280px, 80vw);
    padding-top: 66px;
    background-color: var(--surface-color);
    border-right: 1px solid rgb(66, 66, 66);
    font-family: "Inter", sans-serif;
  }
  .drawer a {
    padding: 14px 20px;
    border-bottom: 1px solid var(--body-background-color);
    border-left: 4px solid transparent;
    font-size: 17px;
    font-weight: 700;
    color: rgb(207, 207, 207);
  }
  .drawer a:hover,
  .drawer a:focus-visible {
    color: white;
    background-color: var(--body-background-color);
  }
  .drawer a[aria-current="page"] {
    color: white;
    border-left-color: white;
    background-color: var(--body-background-color);
  }

  @media (max-width: 840px) {
    header {
      gap: 8px;
      padding: 0 12px;
    }
    .menu-button {
      display: block;
    }
    .desktop-nav {
      display: none;
    }
    .brand {
      font-size: 22px;
      margin-right: auto;
    }
    .login,
    .profile span {
      font-size: 15px;
    }
    /* Header stays above the drawer so the toggle doubles as the close button. */
    header.menu-open {
      z-index: 60;
    }
  }
  @media (max-width: 480px) {
    .login,
    .profile span {
      font-size: 13px;
    }
    .profile {
      max-width: 140px;
    }
  }
</style>
