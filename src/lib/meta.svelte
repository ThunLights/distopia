<script lang="ts">
	export let siteName = "Distopia.top / Discordサーバー用掲示板";
    export let title = "Distopia / Discordサーバー用掲示板";
    export let keywords = "discord, discord server, discordサーバー掲示板, サーバー, 掲示板";
    export let description = [
        "Distopia.topはDiscordサーバー用掲示板です。",
        "沢山のサーバーが登録されていますので是非一度ご覧ください。"
    ].join("");
    export let url = "/";
</script>

<svelte:head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="{description}">
	<meta name="keywords" content="{keywords}">
	<meta name="theme-color" content="#37b6e4">
	<title>{title}</title>

	<meta property="og:url" content="{url}">
	<meta property="og:type" content="website" />
	<meta property="og:title" content="{title}" />
	<meta property="og:description" content="{description}" />
	<meta property="og:site_name" content="{siteName}" />

	<meta name="format-detection" content="telephone=no,email=no,address=no">

	<meta name="twitter:card" content="summary_large_image">
	<meta name="twitter:site" content="@thunlights">
	<meta name="twitter:creator" content="@thunlights">
</svelte:head>
