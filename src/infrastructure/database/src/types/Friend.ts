export type Friend = {
  readonly userId: string;
  description: string;
  nsfw: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
};

export type FriendUpsertInput = Pick<Friend, "userId" | "description"> & Partial<Friend>;

export type FriendUpdateInput = Pick<Friend, "userId"> & Partial<Friend>;
