import type { UserAuth } from "$lib/shared/types/UserAuth";
import { core } from "./core";
import { jwt } from "./jwt";
import type { Cookies } from "@sveltejs/kit";

const twoMonth = 2 * 30 * 24 * 60 * 60 * 1000;

export async function verifyToken(cookies: Cookies): Promise<UserAuth | null> {
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
        token: verified.newToken ?? auth,
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
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
