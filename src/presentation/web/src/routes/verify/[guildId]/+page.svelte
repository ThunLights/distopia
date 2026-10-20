<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { verifyGuild } from "$lib/client/verify";
  import Meta from "$lib/components/Meta.svelte";
  import { onMount } from "svelte";

  type Turnstile = {
    render(
      container: HTMLElement | undefined,
      options: {
        sitekey: string;
        size?: "normal" | "compact";
        callback: (token: string) => void;
      },
    ): void;
    reset(container?: HTMLElement): void;
  };

  const { data } = $props();
  const { guildId, guildName, clientPlugin } = $derived(data);

  const title = $derived(`「${guildName}」のメンバー認証`);
  const description = "下のボックスを確認して認証を完了してください。";

  let widgetContainer = $state<HTMLDivElement>();
  let turnstileToken = $state<string | null>(null);
  let verifying = $state(false);
  let verified = $state(false);

  onMount(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const turnstile = (window as unknown as { turnstile?: Turnstile }).turnstile;
      turnstile?.render(widgetContainer, {
        sitekey: env.PUBLIC_TURNSTILE_SITE_KEY ?? "",
        size: window.matchMedia("(max-width: 400px)").matches ? "compact" : "normal",
        callback: (token: string) => {
          turnstileToken = token;
        },
      });
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  });

  async function submit() {
    if (!turnstileToken) {
      return;
    }
    verifying = true;
    try {
      verified = await verifyGuild(guildId, turnstileToken, clientPlugin);
    } catch {
      verified = false;
    } finally {
      verifying = false;
    }
    if (!verified) {
      // A Turnstile token is single-use -- without this, every retry after a failure keeps
      // sending the same already-used token and fails Turnstile validation again, forcing a
      // full page reload to get a fresh one.
      turnstileToken = null;
      (window as unknown as { turnstile?: Turnstile }).turnstile?.reset(widgetContainer);
    }
  }
</script>

<Meta {title} {description} />

<main>
  <section class="card" class:done={verified}>
    <div class="icon" aria-hidden="true">
      {#if verified}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path
            d="M12 3l7.5 3v5.5c0 4.6-3.1 8.2-7.5 9.5-4.4-1.3-7.5-4.9-7.5-9.5V6L12 3z"
            stroke-linejoin="round"
          />
          <path d="M9 12l2.2 2.2L15.5 10" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      {/if}
    </div>

    <p class="eyebrow">MEMBER VERIFICATION</p>
    <h1>{guildName}</h1>

    {#if verified}
      <p class="lead">認証が完了しました。サーバーに戻ってご利用ください。</p>
    {:else}
      <p class="lead">{description}</p>

      <div class="widget" bind:this={widgetContainer}></div>

      <button disabled={!turnstileToken || verifying} onclick={submit}>
        {verifying ? "確認中..." : "認証する"}
      </button>
    {/if}
  </section>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    padding: 48px 16px;
  }

  .card {
    --accent: var(--a-tag-color, #6969d5);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    width: 100%;
    max-width: 440px;
    padding: 40px 28px 32px;
    text-align: center;
    color: white;
    background:
      radial-gradient(
        circle at 50% -20%,
        color-mix(in srgb, var(--accent) 28%, transparent),
        transparent 60%
      ),
      rgb(37, 36, 41);
    border: 1px solid rgb(255 255 255 / 0.08);
    border-radius: 16px;
    box-shadow: 0 20px 50px rgb(0 0 0 / 0.35);
  }

  .card.done {
    --accent: #3ba55d;
  }

  .icon {
    display: grid;
    place-items: center;
    width: 72px;
    height: 72px;
    margin-bottom: 4px;
    color: var(--accent);
    background: color-mix(in srgb, var(--accent) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 45%, transparent);
    border-radius: 50%;
    box-shadow: 0 0 32px color-mix(in srgb, var(--accent) 35%, transparent);
  }

  .icon svg {
    width: 36px;
    height: 36px;
  }

  .eyebrow {
    font-size: 11px;
    letter-spacing: 0.18em;
    color: rgb(255 255 255 / 0.5);
  }

  h1 {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.3;
    word-break: break-word;
  }

  .lead {
    font-size: 14px;
    line-height: 1.7;
    color: rgb(207, 207, 207);
  }

  .widget {
    display: flex;
    justify-content: center;
    min-height: 65px;
    margin-top: 6px;
  }

  button {
    box-sizing: border-box;
    width: 100%;
    padding: 12px 16px;
    font: inherit;
    font-weight: 600;
    color: white;
    cursor: pointer;
    background: linear-gradient(
      135deg,
      var(--accent),
      color-mix(in srgb, var(--accent) 60%, #8a5cf6)
    );
    border: none;
    border-radius: 999px;
    transition:
      transform 0.15s,
      filter 0.15s,
      opacity 0.15s;
  }

  button:hover:not(:disabled) {
    filter: brightness(1.12);
    transform: translateY(-1px);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
</style>
