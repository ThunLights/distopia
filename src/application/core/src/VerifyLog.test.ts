import type { DatabaseClient, UserVerifyLog } from "infra-database/types";
import { describe, expect, test, vi } from "vitest";

import { logVerifyResult } from "./VerifyLog";

function fakeState(existing: UserVerifyLog[]) {
  const create = vi.fn(
    async (input: Partial<UserVerifyLog>) => ({ id: 1, ...input }) as UserVerifyLog,
  );
  const findByFingerprintHashes = vi.fn(async (_guildId: string, _hashes: string[]) => existing);
  const database = {
    userVerifyLog: { create, findByFingerprintHashes },
  } as unknown as Pick<DatabaseClient, "userVerifyLog">;
  return { database, create, findByFingerprintHashes };
}

describe("logVerifyResult", () => {
  test("stores no related users when fingerprint is absent", async () => {
    const { database, create } = fakeState([]);
    await logVerifyResult(database, { userId: "u1", guildId: "g1", success: true });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        fingerprint: undefined,
        fingerprintHashes: [],
        relatedUserIds: [],
      }),
    );
  });

  test("flags other users who share at least one fingerprint signal, excluding self", async () => {
    const existing = [
      { userId: "u2" },
      { userId: "u3" },
      { userId: "u1" }, // the requester's own prior attempt
    ] as UserVerifyLog[];
    const { database, create, findByFingerprintHashes } = fakeState(existing);

    await logVerifyResult(database, {
      userId: "u1",
      guildId: "g1",
      success: true,
      fingerprint: { fingerprintjs: "a", canvas: "b", gpu: "c" },
    });

    expect(findByFingerprintHashes).toHaveBeenCalledWith("g1", expect.any(Array));
    const [, hashesArg] = findByFingerprintHashes.mock.calls[0]!;
    expect(hashesArg).toHaveLength(3);

    const [input] = create.mock.calls[0]!;
    const stored = input as { relatedUserIds: string[]; fingerprintHashes: string[] };
    expect(stored.fingerprintHashes).toHaveLength(3);
    expect(stored.relatedUserIds).toEqual(expect.arrayContaining(["u2", "u3"]));
    expect(stored.relatedUserIds).not.toContain("u1");
  });
});
