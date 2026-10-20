<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { verifyGuild } from "$lib/client/verify";
  import Block from "$lib/components/Block.svelte";
  import PrimaryButton from "$lib/components/Button/PrimaryButton.svelte";
  import Icon from "$lib/components/Guild/Icon.svelte";
  import Meta from "$lib/components/Meta.svelte";
  import Title from "$lib/components/Title.svelte";
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

<Block>
  <div class="center">
    <Icon iconUrl={data.iconUrl} width={96} height={96} />
    <Title content={title} />
    {#if verified}
      <p>認証が完了しました。サーバーに戻ってご利用ください。</p>
    {:else}
      <p>{description}</p>
      <div bind:this={widgetContainer}></div>
      <PrimaryButton disabled={!turnstileToken || verifying} onclick={submit}>
        {verifying ? "確認中..." : "認証する"}
      </PrimaryButton>
    {/if}
  </div>
</Block>

<style>
  .center {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
  }
</style>
