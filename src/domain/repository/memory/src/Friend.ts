export type Value = {
  username: string;
  description: string;
  nsfw: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
};

export class Friend extends Map<string, Value> {}
