export type UserWeb = {
  id: string;
  jwtVerifyKey: string;
};

export type UserWebUpsertInput = Pick<UserWeb, "id"> & Partial<UserWeb>;
