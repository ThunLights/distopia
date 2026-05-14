import type { GuildDBValue } from "./GuildDBValue";

export type SearchResult = {
  hits: GuildDBValue[];
  count: number;
  time: string;
};
