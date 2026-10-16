import { describe, expect, it } from "vitest";

import { buildBotInviteUrl, buildLoginUrl } from "./oauthUrl";

describe("oauthUrl", () => {
  it("builds the bot invite url", () => {
    const url = new URL(buildBotInviteUrl("123"));
    expect(url.origin + url.pathname).toBe("https://discord.com/oauth2/authorize");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: "123",
      permissions: "8",
      integration_type: "0",
      scope: "bot",
    });
  });

  it("builds the login url with an encoded redirect uri", () => {
    const url = new URL(buildLoginUrl("123", "https://distopia.top/auth"));
    expect(url.searchParams.get("redirect_uri")).toBe("https://distopia.top/auth");
    expect(url.searchParams.get("response_type")).toBe("code");
  });
});
