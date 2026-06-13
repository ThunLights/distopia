export type UserWeb = {
  userId: string;
  jwtVerifyKey: Uint8Array<ArrayBuffer> | null;
};

export type UserWebUpsertInput = Pick<UserWeb, "userId"> & Partial<UserWeb>;
