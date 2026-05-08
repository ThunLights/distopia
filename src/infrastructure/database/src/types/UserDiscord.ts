export type UserDiscord = {
  id: string;
  accessToken: string;
  refreshToken: string;
  email: string | null;
  updatedAt: Date;
};

export type UserDiscordUpsertInput = Pick<UserDiscord, "id" | "accessToken" | "refreshToken"> &
  Partial<UserDiscord>;
