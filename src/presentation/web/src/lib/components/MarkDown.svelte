<script lang="ts">
  import { PUBLIC_BOT_INVITE_LINK } from "$env/static/public";
  import "$lib/assets/md.css";
  import { DISCORD_INVITE_LINK } from "app-core/constant";
  import MarkDown from "svelte-exmarkdown";
  import { gfmPlugin } from "svelte-exmarkdown/gfm";

  export type Props = {
    content: string;
  };

  const { content }: Props = $props();
  const md = $derived(
    content
      .replaceAll("DISCORD_INVITE_LINK", DISCORD_INVITE_LINK)
      .replaceAll("BOT_INVITE_LINK", PUBLIC_BOT_INVITE_LINK),
  );
  const plugins = [gfmPlugin()];
</script>

<MarkDown {md} {plugins} />
