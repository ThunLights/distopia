<script lang="ts">
  const {
    siteName = "Distopia.top / Discordサーバー用掲示板",
    title = "Distopia / Discordサーバー用掲示板",
    keywords = ["discord", "discord server", "discordサーバー掲示板", "サーバー", "掲示板"],
    description = [
      "Distopia.topはDiscordサーバー用掲示板です。",
      "沢山のサーバーが登録されていますので是非一度ご覧ください。",
    ].join(""),
    url = "https://distopia.top/",
  } = $props();
</script>

<svelte:head>
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords.join(", ")} />
  <meta name="theme-color" content="#37b6e4" />
  <title>{title}</title>

  <meta property="og:url" content={url} />
  <meta property="og:type" content="website" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:site_name" content={siteName} />

  <meta name="format-detection" content="telephone=no,email=no,address=no" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@thunlights" />
  <meta name="twitter:creator" content="@thunlights" />
</svelte:head>
