import { env } from "$env/dynamic/public";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = () => {
  if (!env.PUBLIC_SELLER_NAME) {
    return error(500, { message: "PUBLIC_SELLER_NAME is not configured" });
  }
  return { sellerName: env.PUBLIC_SELLER_NAME };
};
