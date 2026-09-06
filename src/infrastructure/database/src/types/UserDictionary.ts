export type UserDictionary = {
  userId: string;
  word: string;
  reading: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UserDictionaryUpsertInput = Pick<UserDictionary, "userId" | "word" | "reading">;
