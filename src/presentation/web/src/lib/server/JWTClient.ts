import type { JWTAlg } from "infra-database/types";
import jwt from "jsonwebtoken";
import { z } from "zod";

export type Value = {
  alg: JWTAlg;
  key: Buffer;
  createdAt: Date;
};

export const JWTPayloadSchema = z.object({
  userId: z.string(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

export class JWTClient {
  public readonly keys = new Map<number, Value>();

  public async setKey(id: number, value: Value) {
    return this.keys.set(id, value);
  }

  public async deleteKey(id: number) {
    return this.keys.delete(id);
  }

  public async getCurrKey() {
    let curr: {
      id: number;
      value: Value;
    } | null = null;

    for (const [id, value] of this.keys.entries()) {
      if (!curr || id > curr.id) {
        curr = { id, value };
      }
    }

    return curr;
  }

  public async sign(payload: JWTPayload) {
    const currKey = await this.getCurrKey();

    if (!currKey) {
      return null;
    }

    return jwt.sign(payload, currKey.value.key, {
      algorithm: currKey.value.alg,
      keyid: currKey.id.toString(),
      expiresIn: "8Weeks",
    });
  }

  public async verify(token: string) {
    try {
      const decodedToken = jwt.decode(token, { complete: true });
      const keyId = Number(decodedToken?.header.kid);

      if (isNaN(keyId)) {
        return null;
      }

      const value = this.keys.get(keyId);

      if (!value) {
        return null;
      }

      const verified = jwt.verify(token, value.key, {
        algorithms: [value.alg],
        complete: true,
      });

      const payload = await JWTPayloadSchema.safeParseAsync(verified.payload);

      if (payload.success) {
        return payload.data;
      }

      return null;
    } catch {
      return null;
    }
  }
}
