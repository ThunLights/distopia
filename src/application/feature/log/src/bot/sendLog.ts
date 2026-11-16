import type { AppCore } from "app-core";
import type { Guild } from "discord.js";
import type { LogFormat } from "presentation-bot-kit/logging/format";
import { Logger } from "presentation-bot-kit/logging/Logger";

import type { LogField } from "./log";
import { logFormats } from "./logFormats";

export async function sendLog<F extends LogField>(
  core: AppCore,
  guild: Guild,
  field: F,
  ...args: Parameters<(typeof logFormats)[F]["build"]>
): Promise<void> {
  await new Logger(core).log(guild, field, logFormats[field] as LogFormat<typeof args>, ...args);
}
