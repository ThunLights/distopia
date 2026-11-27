import { SearchPageSchema } from "#lib/shared/types/routes/api/guild/search.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const page = SearchPageSchema.safeParse(Number(e.url.searchParams.get("p")));

  return {
    // searchParams.get already decodes; decoding again breaks terms containing "%".
    word: e.url.searchParams.get("w"),
    serverTag: e.url.searchParams.get("tag") === "1",
    page: page.success ? page.data : 1,
  };
};
