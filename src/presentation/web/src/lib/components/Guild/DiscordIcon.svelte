<script lang="ts">
  import { buildDiscordIconUrl, type DiscordIconSize } from "$lib/utils/discordIcon";

  type Props = {
    iconUrl: string | null | undefined;
    size?: DiscordIconSize;
    alt?: string;
    class?: string;
  };

  const { iconUrl, size = 128, alt = "", class: className }: Props = $props();
</script>

<img src={buildDiscordIconUrl(iconUrl, size)} {alt} class={className} />
