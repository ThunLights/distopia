export type User = {
  userId: string;
  bumpCounter: number | null;
};

export type UserUpdateInput = Pick<User, "userId"> & Partial<User>;

export type UserUpsertInput = Pick<User, "userId"> & Partial<User>;
