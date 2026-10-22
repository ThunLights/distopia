export type User = {
  userId: string;
  bumpCounter: number | null;
  ttsSpeakerId: number | null;
  level: bigint;
  point: bigint;
};

export type UserUpdateInput = Pick<User, "userId"> & Partial<User>;

export type UserUpsertInput = Pick<User, "userId"> & Partial<User>;
