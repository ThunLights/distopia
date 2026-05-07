export type Value = {
  alg: "HS256";
  key: Buffer;
  createdAt: Date;
};

export class JWTKey extends Map<number, Value> {}
