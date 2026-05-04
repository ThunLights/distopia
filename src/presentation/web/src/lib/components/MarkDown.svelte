<script lang="ts">
  import "$lib/assets/a-tag.css";
  import "$lib/assets/md.css";
  import { DISCORD_INVITE_LINK } from "app-core/constant";
  import MarkDown from "svelte-exmarkdown";
  import { gfmPlugin } from "svelte-exmarkdown/gfm";

  export type Props = {
    content: string;
  };

  const { content }: Props = $props();
  const md = $derived(content.replaceAll("DISCORD_INVITE_LINK", DISCORD_INVITE_LINK));
  const plugins = [gfmPlugin()];
</script>

<MarkDown {md} {plugins} />
