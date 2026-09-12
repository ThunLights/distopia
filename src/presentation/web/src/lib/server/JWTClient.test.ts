import { JWTClient, type JWTPayload } from "./JWTClient";
import { core } from "./core";
import jsonwebtoken from "jsonwebtoken";
import { describe, expect, suite, test } from "vitest";

describe("jwt", async () => {
  const jwt = new JWTClient();
  await core.jwt.genNewKey();
  await core.jwt.genNewKey();

  test("jwt sign", async () => {
    const token = await jwt.sign({ userId: "123" });

    expect(token).not.toBeNull();

    if (token) {
      const verified = await jwt.verify(token);
      expect(verified.payload).toEqual({ userId: "123" });
    }
  });

  test("renews a token expiring within 14 days but not one expiring beyond it", async () => {
    const userId = "near-exp-boundary";
    const userVerifyKey =
      (await core.jwt.getUserVerifyKey(userId)) ??
      (await core.jwt.updateNewUserVerifyKey(userId)).jwtVerifyKey;
    const currKey = await core.jwt.getCurrKey();
    if (!currKey) {
      throw new Error("no current jwt key");
    }

    // Sign tokens directly (bypassing JWTClient.sign's fixed 8-week expiry) so the
    // near-expiry boundary in JWTClient.verify can be exercised deterministically.
    const jwtKey = Buffer.concat([currKey.value.key, userVerifyKey]);
    const nearExpToken = jsonwebtoken.sign({ userId } satisfies JWTPayload, jwtKey, {
      algorithm: currKey.value.alg,
      keyid: currKey.id.toString(),
      expiresIn: "13d",
    });
    const freshToken = jsonwebtoken.sign({ userId } satisfies JWTPayload, jwtKey, {
      algorithm: currKey.value.alg,
      keyid: currKey.id.toString(),
      expiresIn: "15d",
    });

    const nearExpResult = await jwt.verify(nearExpToken);
    const freshResult = await jwt.verify(freshToken);

    expect(nearExpResult.payload).toEqual({ userId });
    expect(nearExpResult.newToken).toBeDefined();
    expect(freshResult.payload).toEqual({ userId });
    expect(freshResult.newToken).toBeUndefined();
  });

  suite("vulnerability", async () => {
    test("forgery userId", async () => {
      const token = await jwt.sign({ userId: "123" });

      expect(token).not.toBeNull();

      if (token) {
        const [baseHeader, payload, signature] = token.split(".") as [string, string, string];
        const header = btoa(
          JSON.stringify({
            ...JSON.parse(atob(baseHeader)),
            userId: "456",
          }),
        );
        const genedToken = [header, payload, signature].join(".");

        console.log("generated token:", genedToken);

        const verified = await jwt.verify(genedToken);
        expect(verified.payload).toBe(null);
      }
    });

    test("alg: none", async () => {
      const token = await jwt.sign({ userId: "123" });

      expect(token).not.toBeNull();

      if (token) {
        const [baseHeader, payload, signature] = token.split(".") as [string, string, string];
        const header = btoa(
          JSON.stringify({
            ...JSON.parse(atob(baseHeader)),
            alg: "none",
          }),
        );
        const genedToken = [header, payload, signature].join(".");

        console.log("generated token:", genedToken);

        const verified = await jwt.verify(genedToken);
        expect(verified.payload).toBe(null);
      }
    });

    test("kid: /dev/null", async () => {
      const token = await jwt.sign({ userId: "123" });

      expect(token).not.toBeNull();

      if (token) {
        const [baseHeader, payload, signature] = token.split(".") as [string, string, string];
        const header = btoa(
          JSON.stringify({
            ...JSON.parse(atob(baseHeader)),
            kid: "/dev/null",
          }),
        );
        const genedToken = [header, payload, signature].join(".");

        console.log("generated token:", genedToken);

        const verified = await jwt.verify(genedToken);
        expect(verified.payload).toBe(null);
      }
    });

    test("kid: []", async () => {
      const token = await jwt.sign({ userId: "123" });

      expect(token).not.toBeNull();

      if (token) {
        const [baseHeader, payload, signature] = token.split(".") as [string, string, string];
        const header = btoa(
          JSON.stringify({
            ...JSON.parse(atob(baseHeader)),
            kid: [],
          }),
        );
        const genedToken = [header, payload, signature].join(".");

        console.log("generated token:", genedToken);

        const verified = await jwt.verify(genedToken);
        expect(verified.payload).toBe(null);
      }
    });
  });
});
