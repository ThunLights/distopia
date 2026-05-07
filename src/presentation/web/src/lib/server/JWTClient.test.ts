import { JWTClient } from "./JWTClient";
import { core } from "./core";
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
      expect(verified).toEqual({ userId: "123" });
    }
  });

  suite("vulnerability", async () => {
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
        expect(verified).toBe(null);
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
        expect(verified).toBe(null);
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
        expect(verified).toBe(null);
      }
    });
  });
});
