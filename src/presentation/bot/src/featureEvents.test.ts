import type { AppCore } from "app-core";
import type { Role } from "discord.js";
import { FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";
import { SkipOtherProcess } from "presentation-bot-kit/feature";
import { describe, expect, it, vi } from "vitest";

const { features } = vi.hoisted(() => ({
  features: [] as { events?: (new (core: AppCore) => FeatureEventBase)[] }[],
}));
vi.mock("app-feature-loader/bot", () => ({ features }));

import { emitFeatureEvent } from "./featureEvents";

const role = {} as Role;

function listener(handle: (role: Role) => Promise<void | SkipOtherProcess>) {
  return class extends FeatureEventBase<"roleCreate"> {
    public override readonly event = "roleCreate";
    public override handle = handle;
  };
}

describe("emitFeatureEvent", () => {
  it("stops at a listener returning SkipOtherProcess and returns it", async () => {
    const later = vi.fn();
    features.splice(
      0,
      features.length,
      { events: [listener(async () => new SkipOtherProcess())] },
      { events: [listener(later)] },
    );

    expect(await emitFeatureEvent({} as AppCore, "roleCreate", role)).toBeInstanceOf(
      SkipOtherProcess,
    );
    expect(later).not.toHaveBeenCalled();
  });

  it("keeps going past a throwing listener and returns nothing", async () => {
    const later = vi.fn().mockResolvedValue(undefined);
    features.splice(
      0,
      features.length,
      {
        events: [
          listener(async () => {
            throw new Error("boom");
          }),
        ],
      },
      { events: [listener(later)] },
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(await emitFeatureEvent({} as AppCore, "roleCreate", role)).toBeUndefined();
    expect(later).toHaveBeenCalledWith(role);
  });
});
