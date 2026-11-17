import type { AppCore } from "app-core";
import type { Role } from "discord.js";
import { EventPriority, FeatureEventBase } from "presentation-bot-kit/base/FeatureEventBase";
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

  it("builds listeners once per core and only runs those for the emitted event", async () => {
    const cores: AppCore[] = [];
    const otherEvent = vi.fn();
    class Tracked extends FeatureEventBase<"roleCreate"> {
      public override readonly event = "roleCreate";
      constructor(core: AppCore) {
        super(core);
        cores.push(core);
      }
      public override async handle() {}
    }
    class Other extends FeatureEventBase<"roleDelete"> {
      public override readonly event = "roleDelete";
      public override handle = otherEvent;
    }
    features.splice(0, features.length, { events: [Tracked, Other] });

    const coreA = {} as AppCore;
    const coreB = {} as AppCore;
    await emitFeatureEvent(coreA, "roleCreate", role);
    await emitFeatureEvent(coreA, "roleCreate", role);
    await emitFeatureEvent(coreB, "roleCreate", role);

    expect(cores).toEqual([coreA, coreB]);
    expect(cores[0]).toBe(coreA);
    expect(cores[1]).toBe(coreB);
    expect(otherEvent).not.toHaveBeenCalled();
  });

  it("runs higher priority listeners first, keeping feature order on ties", async () => {
    const order: string[] = [];
    const tracked = (name: string, priority: number) =>
      class extends FeatureEventBase<"roleCreate"> {
        public override readonly event = "roleCreate";
        public override readonly priority = priority;
        public override async handle() {
          order.push(name);
        }
      };
    features.splice(
      0,
      features.length,
      { events: [tracked("log", EventPriority.Logging)] },
      { events: [tracked("a", EventPriority.Default)] },
      { events: [tracked("b", EventPriority.Default)] },
      { events: [tracked("antiRaid", EventPriority.Moderation)] },
    );

    await emitFeatureEvent({} as AppCore, "roleCreate", role);

    expect(order).toEqual(["antiRaid", "a", "b", "log"]);
  });
});
