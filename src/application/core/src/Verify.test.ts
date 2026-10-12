import type { UserVerifyLog } from "infra-database/types";
import { describe, expect, test, vi } from "vitest";

import type { AppState } from "./AppState";
import { Verify } from "./Verify";

function fakeState(existing: UserVerifyLog[]) {
  const create = vi.fn(
    async (input: Partial<UserVerifyLog>) => ({ id: 1, ...input }) as UserVerifyLog,
  );
  const findByFingerprintHashes = vi.fn(async (_guildId: string, _hashes: string[]) => existing);
  const state = {
    database: {
      userVerifyLog: { create, findByFingerprintHashes },
    },
  } as unknown as AppState;
  return { state, create, findByFingerprintHashes };
}

describe("Verify.logResult", () => {
  test("stores no related users when fingerprint is absent", async () => {
    const { state, create } = fakeState([]);
    await new Verify(state).logResult({ userId: "u1", guildId: "g1", success: true });

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
    const { state, create, findByFingerprintHashes } = fakeState(existing);

    await new Verify(state).logResult({
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
