import { mockGuildCards, mockGuildRankings, mockUserGuilds, mockUserRankings } from "./data";
import { spyOn } from "storybook/test";

const jsonResponse = (data: unknown, status = 200): Response =>
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
    });
  }

  if (url.includes("/api/guild/search") && method === "POST") {
    return jsonResponse({
      guilds: mockGuildCards,
      time: "0.05",
      count: mockGuildCards.length,
    });
  }

  if (url.includes("/api/user/cache") && method === "DELETE") {
    return jsonResponse({ guilds: mockUserGuilds });
  }

  if (url.includes("/api/user/logout") && method === "DELETE") {
    return new Response(null, { status: 200 });
  }

  if (url.includes("/api/guild/join") && method === "POST") {
    return jsonResponse({ url: "https://discord.gg/example" });
  }

  return new Response(null, { status: 404 });
}

export function setupFetchMock() {
  return spyOn(globalThis, "fetch").mockImplementation(globalFetchMock);
}
