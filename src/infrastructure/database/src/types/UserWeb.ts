export type UserWeb = {
  id: string;
  jwtVerifykey: string;
};

export type UserWebUpsertInput = Pick<UserWeb, "id"> & Partial<UserWeb>;
