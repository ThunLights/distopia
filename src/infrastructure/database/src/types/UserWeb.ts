export type UserWeb = {
  id: string;
  jwtVerifyId: string;
};

export type UserWebUpsertInput = Pick<UserWeb, "id"> & Partial<UserWeb>;
