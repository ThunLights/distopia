import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import {
  MessageFlags,
  type Guild,
  type GuildChannelResolvable,
  type PermissionsBitField,
  type UserSelectMenuInteraction,
} from "discord.js";
import { describe, expect, test } from "vitest";

import { UserSelectMenuInteractionBase } from "./UserSelectMenuInteractionBase";

class TestUserSelectMenu extends UserSelectMenuInteractionBase {
  public readonly customId = "test-user-select";
  public execCallCount = 0;

  protected override async exec(
    _interaction: UserSelectMenuInteraction,
    options: { userId: string },
  ) {
    this.execCallCount++;
    return options.userId;
  }
}

function buildInteraction(
  permissionsGranted: boolean,
  values: string[] = ["123456"],
): UserSelectMenuInteraction {
  return {
    customId: "test-user-select",
    channelId: "123",
    values,
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
  } as unknown as UserSelectMenuInteraction;
}

describe("UserSelectMenuInteractionBase", () => {
  test("runs exec and returns its result when permission is granted", async () => {
    const menu = new TestUserSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(true, ["123456"]));

    expect(result).toBe("123456");
    expect(menu.execCallCount).toBe(1);
  });

  test("returns an ephemeral permission error and never calls exec when permission is denied", async () => {
    const menu = new TestUserSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(false, ["123456"]));

    expect(result).toEqual(
      expect.objectContaining({
        flags: [MessageFlags.Ephemeral],
      }),
    );
    expect(menu.execCallCount).toBe(0);
  });
});
