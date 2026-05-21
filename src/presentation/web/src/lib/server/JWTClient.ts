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

export type VerifyResult = {
  payload: JWTPayload | null;
  newToken?: string;
};

const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

export class JWTClient {
  constructor() {
    core.jwt.importDB();
  }

  public async sign(payload: JWTPayload) {
    const userVerifyKey =
      (await core.jwt.getUserVerifyKey(payload.userId)) ??
      (await core.jwt.updateNewUserVerifyKey(payload.userId)).jwtVerifyKey;
    const currKey = await core.jwt.getCurrKey();

    if (!currKey) {
      return null;
    }

    return jwt.sign(
      payload satisfies JWTPayload,
      Buffer.concat([currKey.value.key, userVerifyKey]),
      {
        algorithm: currKey.value.alg,
        keyid: currKey.id.toString(),
        expiresIn: "8Weeks",
      },
    );
  }

  public async verify(token: string): Promise<VerifyResult> {
    try {
      const decodedToken = jwt.decode(token, { complete: true });
      const unVerifiedPayload = decodedToken?.payload;
      const keyId = Number(decodedToken?.header.kid);
      let nearExp = false;

      if (isNaN(keyId)) {
        return { payload: null };
      }
      if (typeof unVerifiedPayload !== "string" && typeof unVerifiedPayload?.exp === "number") {
        const expMs = unVerifiedPayload.exp * 1000; // exp is in seconds, convert to ms
        if (expMs < Date.now() + fourteenDaysMs) {
          nearExp = true;
        }
      }

      if (
        !unVerifiedPayload ||
        typeof unVerifiedPayload === "string" ||
        !("userId" in unVerifiedPayload) ||
        typeof unVerifiedPayload.userId !== "string"
      ) {
        return { payload: null };
      }

      const value = await core.jwt.findJwtKey(keyId);
      const userKey = await core.jwt.getUserVerifyKey(unVerifiedPayload.userId);

      if (!value || !userKey) {
        return { payload: null };
      }

      const verified = jwt.verify(token, Buffer.concat([value.key, userKey]), {
        algorithms: [value.alg],
        complete: true,
      });

      const payload = await JWTPayloadSchema.safeParseAsync(verified.payload);

      if (payload.success) {
        const data = {
          userId: payload.data.userId,
        } satisfies JWTPayload;

        if (nearExp) {
          const newToken = await this.sign(data);
          return {
            payload: data,
            newToken: newToken ?? undefined,
          };
        }
        return {
          payload: data,
          newToken: undefined,
        };
      }

      return { payload: null };
    } catch {
      return { payload: null };
    }
  }
}
