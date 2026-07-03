import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import {
  MessageFlags,
  type Guild,
  type GuildChannelResolvable,
  type PermissionsBitField,
  type RoleSelectMenuInteraction,
} from "discord.js";
import { describe, expect, test } from "vitest";

import { RoleSelectMenuInteractionBase, type OptionsSchema } from "./RoleSelectMenuInteractionBase";

class TestRoleSelectMenu extends RoleSelectMenuInteractionBase<typeof OptionsSchema> {
  public readonly customId = "test-role-select";
  public execCallCount = 0;

  protected override async exec(
    _interaction: RoleSelectMenuInteraction,
    options: { roleId: string },
  ) {
    this.execCallCount++;
    return options.roleId;
  }
}

function buildInteraction(
  permissionsGranted: boolean,
  values: string[] = ["123456"],
): RoleSelectMenuInteraction {
  return {
    customId: "test-role-select",
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
  } as unknown as RoleSelectMenuInteraction;
}

describe("RoleSelectMenuInteractionBase", () => {
  test("runs exec and returns its result when permission is granted", async () => {
    const menu = new TestRoleSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(true, ["123456"]));

    expect(result).toBe("123456");
    expect(menu.execCallCount).toBe(1);
  });

  test("returns an ephemeral permission error and never calls exec when permission is denied", async () => {
    const menu = new TestRoleSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(false, ["123456"]));

    expect(result).toEqual(
      expect.objectContaining({
        flags: [MessageFlags.Ephemeral],
      }),
    );
    expect(menu.execCallCount).toBe(0);
  });

  test("checks permission before validating options: an invalid roleId with denied permission still yields a permission error", async () => {
    const menu = new TestRoleSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(false, ["not-a-role-id"]));

    expect(result).toEqual(
      expect.objectContaining({
        flags: [MessageFlags.Ephemeral],
      }),
    );
    expect(menu.execCallCount).toBe(0);
  });

  test("does not run exec when the selected value fails schema validation", async () => {
    const menu = new TestRoleSelectMenu(new AppCore({} as AppState));

    const result = await menu.run(buildInteraction(true, ["not-a-role-id"]));

    expect(menu.execCallCount).toBe(0);
    expect(result).not.toBe("not-a-role-id");
  });
});
