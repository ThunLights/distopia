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

export const JWTPayloadWithUserVerifyKeySchema = JWTPayloadSchema.extend({
  userVerifyKey: z.string(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

export type JWTPayloadWithUserVerifyKey = z.infer<typeof JWTPayloadWithUserVerifyKeySchema>;

export class JWTClient {
  constructor() {
    core.jwt.importDB();
  }

  public async sign(payload: JWTPayload) {
    const userVerifyKey =
      (await core.jwt.getUserVerifyKey(payload.userId)) ??
      (await core.jwt.updateNewUserVerifyKey(payload.userId)).jwtVerifykey;
    const currKey = await core.jwt.getCurrKey();

    if (!currKey) {
      return null;
    }

    return jwt.sign(
      {
        ...payload,
        userVerifyKey,
      } satisfies JWTPayloadWithUserVerifyKey,
      currKey.value.key,
      {
        algorithm: currKey.value.alg,
        keyid: currKey.id.toString(),
        expiresIn: "8Weeks",
      },
    );
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

      const payload = await JWTPayloadWithUserVerifyKeySchema.safeParseAsync(verified.payload);

      if (payload.success) {
        const userVerifyKey = await core.jwt.getUserVerifyKey(payload.data.userId);
        if (payload.data.userVerifyKey !== userVerifyKey) {
          return null;
        }

        const data = {
          userId: payload.data.userId,
        } satisfies JWTPayload;

        if (nearExp) {
          const newToken = await this.sign(data);
          return {
            payload: data,
            newToken,
          };
        }
        return {
          payload: data,
        };
      }

      return null;
    } catch {
      return null;
    }
  }
}
