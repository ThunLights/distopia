import { PUBLIC_SELLER_NAME } from "$app/env/public";
import type { PageServerLoad } from "./$types";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = () => {
  if (!PUBLIC_SELLER_NAME) {
    return error(500, { message: "PUBLIC_SELLER_NAME is not configured" });
  }
  return { sellerName: PUBLIC_SELLER_NAME };
};
