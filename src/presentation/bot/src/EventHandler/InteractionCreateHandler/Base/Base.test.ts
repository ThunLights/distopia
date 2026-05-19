import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import type {
  BaseInteraction,
  CacheType,
  Guild,
  GuildChannelResolvable,
  PermissionsBitField,
} from "discord.js";
import { describe, expect, test } from "vitest";

import { Base } from "./Base";
import { PermissionSuccess } from "./Permission/PermissionSuccess";

class TestCommand extends Base<BaseInteraction> {
  public override async match(_interaction: BaseInteraction<CacheType>): Promise<boolean> {
    return true;
  }

  public override async run(_interaction: BaseInteraction<CacheType>): Promise<void> {}

  public async test(interaction: BaseInteraction<CacheType>) {
    return (await this.checkPermission(interaction)) instanceof PermissionSuccess;
  }
}

const testCommand = new TestCommand(new AppCore({} as AppState));

describe("Base.ts", () => {
  describe("PermissionCheck", () => {
    test("requireBotGuildPermissions", async () => {
      expect(
        await testCommand.test({
          guild: {
            members: {
              me: {
                permissions: {
                  has(_permission, _checkAdmin) {
                    return true;
                  },
                },
                permissionsIn(_channel: GuildChannelResolvable) {
                  return {
                    has(_permission, _checkAdmin) {
                      return true;
                    },
                  };
                },
              },
            },
          } as Guild,
          memberPermissions: {
            has(_permission, _checkAdmin) {
              return true;
            },
          } as PermissionsBitField,
        } as unknown as BaseInteraction),
      ).toBe(false);
    });
  });
});
