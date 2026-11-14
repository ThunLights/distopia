import { DiscordOAuth2 } from "discoauth";

const AUTHORIZE_URL = "https://discord.com/oauth2/authorize";

function buildAuthorizeUrl(params: Record<string, string>): string {
  const url = new URL(AUTHORIZE_URL);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

export function buildBotInviteUrl(clientId: string): string {
  return buildAuthorizeUrl({
    client_id: clientId,
    permissions: "8",
    integration_type: "0",
    scope: "bot",
  });
}

export function buildLoginUrl(clientId: string, redirectUri: string): string {
  return new DiscordOAuth2({ clientId, redirectUri }).authorizeUrl({
    scope: ["identify", "guilds", "email", "guilds.join"],
  });
}
