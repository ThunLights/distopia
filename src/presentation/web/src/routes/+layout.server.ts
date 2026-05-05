import { verifyToken } from "$lib/server/auth.js";

export const load = async (e) => {
  const user = await verifyToken(e.cookies);

  return { user };
};
