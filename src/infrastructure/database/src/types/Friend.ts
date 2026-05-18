export type Friend = {
  readonly userId: string;
  username: string;
  description: string;
  nsfw: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
};

export type FriendUpsertInput = Pick<Friend, "userId" | "username" | "description"> &
  Partial<Friend>;

export type FriendUpdateInput = Pick<Friend, "userId"> & Partial<Friend>;
