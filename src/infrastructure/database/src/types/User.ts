export type User = {
  id: string;
  bumpCounter: number | null;
};

export type UserUpdateInput = Pick<User, "id"> & Partial<User>;

export type UserUpsertInput = Pick<User, "id"> & Partial<User>;
