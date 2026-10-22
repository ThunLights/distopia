<script lang="ts">
  import { DISCORD_INVITE_LINK } from "#lib/shared/constant.js";
  import { resolve } from "$app/paths";

  const { fixed = false } = $props();
</script>

<footer class={fixed ? "footer-fixed" : ""}>
  <nav aria-label="フッター">
    <a href={resolve("terms")}>利用規約</a>
    <a href={resolve("privacy")}>プライバシーポリシー</a>

    <a href={resolve("specific-commercial-transaction-act")}>特定商取引法に基づく表記</a>

    <a href={resolve("guideline")}>ガイドライン</a>
    <a href={DISCORD_INVITE_LINK} rel="external">お問い合わせ</a>
  </nav>
  <p>
    Supported by <a href="https://www.thunlights.com">Team ThunLights</a> · © Distopia
  </p>
</footer>

<style>
  footer {
    background-color: #212227;
    padding: 12px 16px;
    text-align: center;
    color: #9ca3af;
  }
  nav {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 4px 16px;
    margin-bottom: 6px;
  }
  a {
    color: rgb(88, 212, 228);
  }
  .footer-fixed {
    width: 100%;
    position: fixed;
    bottom: 0;
  }
</style>
