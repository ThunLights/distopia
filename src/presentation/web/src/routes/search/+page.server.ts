import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (e) => {
  const page = Number(e.url.searchParams.get("p"));

  return {
    // searchParams.get already decodes; decoding again breaks terms containing "%".
    word: e.url.searchParams.get("w"),
    serverTag: e.url.searchParams.get("tag") === "1",
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
};
