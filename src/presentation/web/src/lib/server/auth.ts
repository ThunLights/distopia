import type { UserAuth } from "$lib/shared/types/UserAuth";
import { controller } from "./discord";
import { jwt } from "./jwt";
import type { Cookies } from "@sveltejs/kit";

export async function verifyToken(cookies: Cookies): Promise<UserAuth | null> {
  const auth = cookies.get("auth");

  if (!auth) {
    return null;
  }

  const payload = await jwt.verify(auth);

  if (!payload) {
    return null;
  }

  const user = await controller.user.find(payload.userId);

  return user
    ? {
        token: auth,
        id: user.id,
        username: user.name,
        avatarUrl: user.avatarUrl,
      }
    : null;
}
