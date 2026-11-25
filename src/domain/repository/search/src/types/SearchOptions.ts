export type SearchOptions = {
  filter: {
    nsfw?: boolean;
    serverTag?: boolean;
  };
  alg?: ("exact" | "preflight")[];
};
