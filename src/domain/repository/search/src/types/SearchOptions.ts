export type SearchOptions = {
  filter: {
    nsfw?: boolean;
  };
  alg?: ("exact" | "preflight")[];
};
