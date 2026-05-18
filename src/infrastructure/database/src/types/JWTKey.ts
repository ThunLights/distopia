export type JWTAlg = "HS256";

export type JWTKey = {
  id: number;
  key: Uint8Array<ArrayBuffer>;
  alg: JWTAlg;
  createdAt: Date;
};
