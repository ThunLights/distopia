import { core } from "./core";
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
  constructor() {
    core.jwt.importDB();
  }

  public async sign(payload: JWTPayload) {
    const currKey = await core.jwt.getCurrKey();

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
      const unParsedPayload = decodedToken?.payload;
      let nearExp = false;

      if (isNaN(keyId)) {
        return null;
      }
      if (typeof unParsedPayload !== "string" && unParsedPayload?.exp) {
        const exp = unParsedPayload.exp;
        if (exp > Date.now() - 14 * 24 * 60 * 60 * 1000) {
          nearExp = true;
        }
      }

      const value = await core.jwt.findJwtKey(keyId);

      if (!value) {
        return null;
      }

      const verified = jwt.verify(token, value.key, {
        algorithms: [value.alg],
        complete: true,
      });

      const payload = await JWTPayloadSchema.safeParseAsync(verified.payload);

      if (payload.success) {
        if (nearExp) {
          const newToken = await this.sign(payload.data);
          return {
            payload: payload.data,
            newToken,
          };
        }
        return {
          payload: payload.data,
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}
