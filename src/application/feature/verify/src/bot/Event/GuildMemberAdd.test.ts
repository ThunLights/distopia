import type { AppCore } from "app-core";
import type { GuildMember } from "discord.js";
import { describe, expect, it, vi } from "vitest";

import { GuildMemberAddEvent } from "./GuildMemberAdd";

function createCore(setting: { enabled: boolean; pendingRoleId: string | null }) {
  const roleGive = vi.fn().mockResolvedValue(undefined);
  const core = {
    verify: {
      getSetting: vi.fn().mockResolvedValue(setting),
    },
    state: {
      discord: {
        role: {
          give: roleGive,
        },
      },
    },
  } as unknown as AppCore;

  return { core, roleGive };
}

function createMember(): GuildMember {
  return { id: "user-1", guild: { id: "guild-1" } } as unknown as GuildMember;
}

describe("GuildMemberAddEvent", () => {
  it("gives the pending role when verification is enabled and a pending role is set", async () => {
    const { core, roleGive } = createCore({ enabled: true, pendingRoleId: "role-1" });

    await new GuildMemberAddEvent(core).handle(createMember());

    expect(roleGive).toHaveBeenCalledWith("guild-1", "user-1", "role-1");
  });

  it("does nothing when verification is disabled", async () => {
    const { core, roleGive } = createCore({ enabled: false, pendingRoleId: "role-1" });

    await new GuildMemberAddEvent(core).handle(createMember());

    expect(roleGive).not.toHaveBeenCalled();
  });

  it("does nothing when no pending role is configured", async () => {
    const { core, roleGive } = createCore({ enabled: true, pendingRoleId: null });

    await new GuildMemberAddEvent(core).handle(createMember());

    expect(roleGive).not.toHaveBeenCalled();
  });

  it("does not reject when giving the pending role fails", async () => {
    const { core, roleGive } = createCore({ enabled: true, pendingRoleId: "role-1" });
    roleGive.mockRejectedValueOnce(new Error("missing permissions"));

    await expect(new GuildMemberAddEvent(core).handle(createMember())).resolves.toBeUndefined();
  });
});
