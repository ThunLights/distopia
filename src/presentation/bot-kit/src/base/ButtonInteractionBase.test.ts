import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import {
  MessageFlags,
  type ButtonInteraction,
  type Guild,
  type GuildChannelResolvable,
  type PermissionsBitField,
} from "discord.js";
import { describe, expect, test } from "vitest";

import { ButtonInteractionBase } from "./ButtonInteractionBase";

class TestButton extends ButtonInteractionBase<ButtonInteraction> {
  public readonly customId = "test-button";
  public execCallCount = 0;

  protected override async exec(_interaction: ButtonInteraction) {
    this.execCallCount++;
    return "ok";
  }
}

function buildInteraction(
  permissionsGranted: boolean,
  customId = "test-button",
): ButtonInteraction {
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
  } as unknown as ButtonInteraction;
}

describe("ButtonInteractionBase", () => {
  test("match compares customId", async () => {
    const button = new TestButton(new AppCore({} as AppState));

    expect(await button.match(buildInteraction(true, "test-button"))).toBe(true);
    expect(await button.match(buildInteraction(true, "other-button"))).toBe(false);
  });

  test("runs exec and returns its result when permission is granted", async () => {
    const button = new TestButton(new AppCore({} as AppState));

    const result = await button.run(buildInteraction(true));

    expect(result).toBe("ok");
    expect(button.execCallCount).toBe(1);
  });

  test("returns an ephemeral permission error and never calls exec when permission is denied", async () => {
    const button = new TestButton(new AppCore({} as AppState));

    const result = await button.run(buildInteraction(false));

    expect(result).toEqual(
      expect.objectContaining({
        flags: [MessageFlags.Ephemeral],
      }),
    );
    expect(button.execCallCount).toBe(0);
  });
});
