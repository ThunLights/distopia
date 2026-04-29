export type GuildReview = {
  userId: string;
  guildId: string;
  star: number;
  content: string | null;
};

export type GuildReviewUpdateInput = Pick<GuildReview, "guildId" | "userId"> & Partial<GuildReview>;

export type GuildReviewUpsertInput = GuildReview & Partial<Pick<GuildReview, "content">>;
