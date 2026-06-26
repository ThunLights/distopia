import type { ResponseMethodPost } from "$lib/shared/types/routes/api/guild/search";
import type { ResponseMethodGet } from "$lib/shared/types/routes/api/ranking";
import type { ResponseBodyTypeGuild } from "$lib/shared/types/routes/api/user/cache";
import { mockGuildCards, mockGuildRankings, mockUserGuilds, mockUserRankings } from "./data";
import { spyOn } from "storybook/test";

const jsonResponse = <T>(data: T, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export async function globalFetchMock(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = input instanceof Request ? input.url : String(input);
  const method = (init?.method ?? "GET").toUpperCase();

  if (url.includes("/api/ranking") && method === "GET") {
    return jsonResponse({
      guild: {
        level: mockGuildRankings,
        activeRate: [...mockGuildRankings].sort(
          (a, b) => (b.activeRate ?? 0) - (a.activeRate ?? 0),
        ),
      },
      user: { bump: mockUserRankings },
    } satisfies ResponseMethodGet);
  }

  if (url.includes("/api/guild/search") && method === "POST") {
    return jsonResponse({
      guilds: mockGuildCards,
      time: "0.05",
      count: mockGuildCards.length,
    } satisfies ResponseMethodPost);
  }

  if (url.includes("/api/user/cache") && method === "DELETE") {
    return jsonResponse({ guilds: mockUserGuilds } satisfies ResponseBodyTypeGuild);
  }

  if (url.includes("/api/user/logout") && method === "DELETE") {
    return new Response(null, { status: 200 });
  }

  if (url.includes("/api/guild/join") && method === "POST") {
    return new Response(null, { status: 201 });
  }

  return new Response(null, { status: 404 });
}

export function setupFetchMock() {
  return spyOn(globalThis, "fetch").mockImplementation(globalFetchMock);
}
