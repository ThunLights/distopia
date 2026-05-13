export type UserDiscord = {
  userId: string;
  accessToken: string;
  refreshToken: string;
  email: string | null;
  updatedAt: Date;
};

export type UserDiscordUpsertInput = Pick<UserDiscord, "userId" | "accessToken" | "refreshToken"> &
  Partial<UserDiscord>;
