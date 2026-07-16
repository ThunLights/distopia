import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import {
  MessageFlags,
  type Guild,
  type GuildChannelResolvable,
  type ModalSubmitInteraction,
  type PermissionsBitField,
} from "discord.js";
import { describe, expect, test } from "vitest";

import { ValidateError, type ValidateResult } from "../../../utils/validator";
import { ModalSubmitInteractionBase } from "./ModalSubmitInteractionBase";

type Options = { value: string };

class TestModal extends ModalSubmitInteractionBase<Options> {
  public readonly customId = "test-modal";
  public execCallCount = 0;

  public override async parseOptions(
    _interaction: ModalSubmitInteraction,
  ): Promise<ValidateResult<Options>> {
    return { value: "ok" };
  }

  protected override async exec(_interaction: ModalSubmitInteraction, options: Options) {
    this.execCallCount++;
    return { content: options.value };
  }
}

class InvalidOptionsModal extends TestModal {
  public override async parseOptions(
    _interaction: ModalSubmitInteraction,
  ): Promise<ValidateResult<Options>> {
    return new ValidateError({ content: "invalid" });
  }
}

function buildInteraction(
  permissionsGranted: boolean,
  customId = "test-modal",
): ModalSubmitInteraction {
  return {
    customId,
    channelId: "123",
    guild: {
      members: {
        me: {
          permissions: {
            has(_permission, _checkAdmin) {
              return permissionsGranted;
            },
          },
          permissionsIn(_channel: GuildChannelResolvable) {
            return {
              has(_permission, _checkAdmin) {
                return permissionsGranted;
              },
            };
          },
        },
      },
    } as Guild,
    memberPermissions: {
      has(_permission, _checkAdmin) {
        return permissionsGranted;
      },
    } as PermissionsBitField,
  } as unknown as ModalSubmitInteraction;
}

describe("ModalSubmitInteractionBase", () => {
  test("match compares customId", async () => {
    const modal = new TestModal(new AppCore({} as AppState));

    expect(await modal.match(buildInteraction(true, "test-modal"))).toBe(true);
    expect(await modal.match(buildInteraction(true, "other-modal"))).toBe(false);
  });

  test("runs exec and returns its result when permission is granted", async () => {
    const modal = new TestModal(new AppCore({} as AppState));

    const result = await modal.run(buildInteraction(true));

    expect(result).toEqual({ content: "ok" });
    expect(modal.execCallCount).toBe(1);
  });

  test("returns an ephemeral permission error and never calls exec when permission is denied", async () => {
    const modal = new TestModal(new AppCore({} as AppState));

    const result = await modal.run(buildInteraction(false));

    expect(result).toEqual(
      expect.objectContaining({
        flags: [MessageFlags.Ephemeral],
      }),
    );
    expect(modal.execCallCount).toBe(0);
  });

  test("does not run exec when options fail validation, even with permission granted", async () => {
    const modal = new InvalidOptionsModal(new AppCore({} as AppState));

    const result = await modal.run(buildInteraction(true));

    expect(result).toEqual({ content: "invalid" });
    expect(modal.execCallCount).toBe(0);
  });
});
