import { core } from "#lib/server/core.js";
import type { Guild } from "#lib/shared/types/routes/api/guild/search.js";

// Finding which guilds wear a tag costs bot RPCs for every public guild, so it runs on
// schedulemanager's 20-minute refresh (hooks.server.ts) instead of per request.
let taggedGuildIds: Promise<Set<string>> | null = null;

async function scanTaggedGuildIds() {
  return new Set(
    (await core.guild.findManySortedBumpTime())
      .filter(({ meta }) => meta.tag)
      .map(({ guild }) => guild.guildId),
  );
}

export async function refreshTaggedGuildIds() {
  const ids = await scanTaggedGuildIds();
  taggedGuildIds = Promise.resolve(ids);
  cached = null;
}

function getTaggedGuildIds() {
  if (!taggedGuildIds) {
    taggedGuildIds = scanTaggedGuildIds();
    taggedGuildIds.catch(() => {
      taggedGuildIds = null;
    });
  }
  return taggedGuildIds;
}

// Only the already-known tagged guilds are re-read here, so bump order and a removed tag show up
// within a minute while a newly added tag waits for the next scheduled scan.
async function fetchTaggedGuilds(): Promise<Guild[]> {
  return (await core.guild.findAllWithMetaData([...(await getTaggedGuildIds())]))
    .filter(({ meta }) => meta.tag)
    .sort((a, b) => b.guild.bumpTime.getTime() - a.guild.bumpTime.getTime())
    .map(({ guild, meta }) => ({
      guildId: guild.guildId,
      name: meta.name,
      description: guild.description,
      invite: guild.invite,
      nsfw: guild.nsfw,
      tags: guild.tags,
      iconUrl: meta.iconUrl ?? null,
      boostCount: meta.serverBoostCount,
      rank: core.record.getActiveRateRanking(guild.guildId) ?? null,
      serverTag: meta.tag ?? null,
      serverTagBadgeUrl: meta.tagBadgeUrl ?? null,
    }));
}

const CACHE_TTL_MS = 60_000;
let cached: { at: number; guilds: Promise<Guild[]> } | null = null;

/** Public guilds wearing a server tag, newest bump first. Cached for a minute. */
export async function getTaggedGuilds(): Promise<Guild[]> {
  if (!cached || Date.now() - cached.at > CACHE_TTL_MS) {
    const guilds = fetchTaggedGuilds();
    cached = { at: Date.now(), guilds };
    guilds.catch(() => {
      cached = null;
    });
  }
  const guilds = await cached.guilds;
  // Going private is saved by the bot process, which can't clear this cache, so recheck here.
  // ponytail: one DB read per tagged guild per request; batch it if tagged guilds grow large.
  const isPublic = await Promise.all(guilds.map(({ guildId }) => core.guild.isPublic(guildId)));
  return guilds.filter((_, index) => isPublic[index]);
}
