import jwt from "jsonwebtoken";
import { z } from "zod";

export const JWTPayloadSchema = z.object({
  userId: z.string(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

export class JWTClient {
  public readonly keys = new Map<number, string>();

  public async setKey(id: number, key: string) {
    return this.keys.set(id, key);
  }

  public async deleteKey(id: number) {
    return this.keys.delete(id);
  }

  public async getCurrKey() {
    let curr: {
      id: number;
      value: string;
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

    return jwt.sign(payload, currKey.value, {
      algorithm: "HS256",
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

      const key = this.keys.get(keyId);

      if (!key) {
        return null;
      }

      const payload = await JWTPayloadSchema.safeParseAsync(
        jwt.verify(token, key, { algorithms: ["HS256"], complete: true }).payload,
      );

      return payload.success ? payload.data : null;
    } catch {
      return null;
    }
  }
}
