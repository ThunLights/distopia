export type GuildReview = {
  userId: string;
  guildId: string;
  star: number;
  content: string | null;
  updatedAt: Date;
};

export type GuildReviewUpdateInput = Pick<GuildReview, "guildId" | "userId"> & Partial<GuildReview>;

export type GuildReviewUpsertInput = Omit<GuildReview, "content" | "updatedAt"> &
  Partial<Pick<GuildReview, "content" | "updatedAt">>;
