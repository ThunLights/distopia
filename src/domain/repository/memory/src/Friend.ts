export type FriendValue = {
  userId: string;
  username: string;
  description: string;
  nsfw: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatarUrl: string | null;
  tags: string[];
};

export class Friend extends Map<string, FriendValue> {}
