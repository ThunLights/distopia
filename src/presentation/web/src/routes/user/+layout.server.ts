import type { LayoutServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";

export const load: LayoutServerLoad = async (e) => {
  const { user } = await e.parent();

  if (!user) {
    return redirect(302, "/");
  }

  return {
    user,
  };
};
