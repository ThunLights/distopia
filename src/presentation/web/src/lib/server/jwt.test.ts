import { JWTClient } from "./jwt";
import { randomUUID } from "crypto";
import { describe, expect, test } from "vitest";

describe("jwt", async () => {
  const jwt = new JWTClient();
  jwt.setKey(1, randomUUID());

  test("jwt sign", async () => {
    const token = await jwt.sign({ userId: "123" });

    expect(token).not.toBeNull();

    if (token) {
      const verified = await jwt.verify(token);
      expect(verified).toEqual({ userId: "123" });
    }
  });
});
