export type UrlCache = {
  url: string;
  isInviteLink: boolean | null;
  updatedAt: Date;
  createdAt: Date;
};

export type UrlCacheUpdateInput = Pick<UrlCache, "url"> & Partial<UrlCache>;

export type UrlCacheUpsertInput = Pick<UrlCache, "url"> & Partial<UrlCache>;
