import type { AppCore } from "app-core";
import type { Role } from "discord.js";
import { SkipOtherProcess } from "presentation-bot-kit/feature";
import { describe, expect, it, vi } from "vitest";

const { features } = vi.hoisted(() => ({
  features: [] as { events?: Record<string, (...args: unknown[]) => Promise<unknown>> }[],
}));
vi.mock("app-feature-loader/bot", () => ({ features }));

import { emitFeatureEvent } from "./featureEvents";

const core = {} as AppCore;
const role = {} as Role;

describe("emitFeatureEvent", () => {
  it("stops at a listener returning SkipOtherProcess and returns it", async () => {
    const later = vi.fn();
    features.splice(
      0,
      features.length,
      {
        events: { roleCreate: async () => new SkipOtherProcess() },
      },
      { events: { roleCreate: later } },
    );

    expect(await emitFeatureEvent(core, "roleCreate", role)).toBeInstanceOf(SkipOtherProcess);
    expect(later).not.toHaveBeenCalled();
  });

  it("keeps going past a throwing listener and returns nothing", async () => {
    const later = vi.fn().mockResolvedValue(undefined);
    features.splice(
      0,
      features.length,
      {
        events: {
          roleCreate: async () => {
            throw new Error("boom");
          },
        },
      },
      { events: { roleCreate: later } },
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await emitFeatureEvent(core, "roleCreate", role)).toBeUndefined();
    expect(later).toHaveBeenCalledWith(core, role);
  });
});
