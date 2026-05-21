import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";
import merge from "deepmerge";
import type {
  BaseInteraction,
  CacheType,
  Guild,
  GuildChannelResolvable,
  PermissionsBitField,
} from "discord.js";
import { describe, expect, suite, test } from "vitest";

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

const interactionForPermissionCheck = {
  channelId: "123",
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
} as unknown as BaseInteraction;

describe("Base.ts", () => {
  describe("PermissionCheck", () => {
    test("valid permissions", async () => {
      expect(await testCommand.test(interactionForPermissionCheck)).toBe(true);
    });

    suite("requireBotGuildPermissions", async () => {
      test("invalid permission", async () => {
        expect(
          await testCommand.test(
            merge<BaseInteraction>(interactionForPermissionCheck, {
              guild: {
                members: {
                  me: {
                    permissions: {
                      has(_permission, _checkAdmin) {
                        return false;
                      },
                    },
                  },
                },
              } as Guild,
            } as BaseInteraction),
          ),
        ).toBe(false);
      });
    });

    suite("requireBotChannelPermissions", async () => {
      test("channelId: null", async () => {
        expect(
          await testCommand.test(
            merge<BaseInteraction>(interactionForPermissionCheck, {
              channelId: null,
            } as BaseInteraction),
          ),
        ).toBe(false);
      });
      test("invalid permission", async () => {
        expect(
          await testCommand.test(
            merge<BaseInteraction>(interactionForPermissionCheck, {
              guild: {
                members: {
                  me: {
                    permissionsIn(_channel: GuildChannelResolvable) {
                      return {
                        has(_permission, _checkAdmin) {
                          return false;
                        },
                      };
                    },
                  },
                },
              } as Guild,
            } as BaseInteraction),
          ),
        ).toBe(false);
      });
    });
  });
});
