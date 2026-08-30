import DiscordIconFallback from "$lib/assets/icon/discord.webp";

// Discord's CDN only serves icons at these fixed power-of-two resolutions.
export const DISCORD_ICON_SIZES = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096] as const;

export type DiscordIconSize = (typeof DISCORD_ICON_SIZES)[number];

export function buildDiscordIconUrl(
  iconUrl: string | null | undefined,
  size: DiscordIconSize,
): string {
  if (!iconUrl) {
    return DiscordIconFallback;
  }
  return `${iconUrl}?size=${size}`;
}
