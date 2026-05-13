export type UserWeb = {
  userId: string;
  jwtVerifyKey: string;
};

export type UserWebUpsertInput = Pick<UserWeb, "userId"> & Partial<UserWeb>;
