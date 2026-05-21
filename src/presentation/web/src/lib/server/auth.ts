import { PUBLIC_BOT_ID, PUBLIC_URL } from "$env/static/public";
import type { UserAuth } from "$lib/shared/types/UserAuth";
import { core } from "./core";
import { jwt } from "./jwt";
import { redirect, type Cookies, type RequestEvent } from "@sveltejs/kit";

const twoMonth = 2 * 30 * 24 * 60 * 60 * 1000;
const stateCookieMaxAge = 10 * 60; // 10 minutes in seconds

export async function verifyToken(
  cookies: Cookies,
): Promise<{ private: { token: string }; public: UserAuth } | null> {
  const auth = cookies.get("authorization");

  if (!auth) {
    return null;
  }

  const verified = await jwt.verify(auth);

  if (!verified.payload) {
    return null;
  }

  const user = await core.user.findWithOAuth2(verified.payload.userId);

  return user
    ? {
        private: {
          token: verified.newToken ?? auth,
        },
        public: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
      }
    : null;
}

export async function setToken(cookies: Cookies, token: string) {
  cookies.set("authorization", token, {
    path: "/",
    expires: new Date(Date.now() + twoMonth),
  });
}

export async function deleteToken(cookies: Cookies) {
  cookies.delete("authorization", { path: "/" });
}

function generateState(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function setOAuthStateCookie(cookies: Cookies): string {
  const state = generateState();
  cookies.set("oauth_state", state, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: stateCookieMaxAge,
  });
  return state;
}

export function getAndVerifyOAuthState(cookies: Cookies, stateFromQuery: string | null): boolean {
  if (!stateFromQuery) {
    return false;
  }
  const storedState = cookies.get("oauth_state");
  if (!storedState) {
    return false;
  }
  // Consume the state cookie immediately to prevent replay
  cookies.delete("oauth_state", { path: "/" });
  return storedState === stateFromQuery;
}

export function redirectToDiscordOAuth(cookies: Cookies): never {
  const state = setOAuthStateCookie(cookies);
  const oauthUrl = new URL("https://discord.com/oauth2/authorize");
  oauthUrl.searchParams.set("client_id", PUBLIC_BOT_ID);
  oauthUrl.searchParams.set("response_type", "code");
  oauthUrl.searchParams.set("redirect_uri", `${PUBLIC_URL}/auth`);
  oauthUrl.searchParams.set("scope", "identify guilds email guilds.join");
  oauthUrl.searchParams.set("state", state);
  throw redirect(302, oauthUrl.toString());
}
