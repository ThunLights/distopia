import type { RedisClient } from "infra-redis";
import z from "zod";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildLogSettingValue = {
  guildId: string;
  logAntiRaid: string | null;
  logMemberJoin: string | null;
  logMemberLeave: string | null;
  logMemberTimeout: string | null;
  logMemberKick: string | null;
  logMemberBan: string | null;
  logMemberUnban: string | null;
  logRoleCreate: string | null;
  logRoleEdit: string | null;
  logRoleDelete: string | null;
  logChannelCreate: string | null;
  logChannelEdit: string | null;
  logChannelDelete: string | null;
  logMessageEdit: string | null;
  logMessageDelete: string | null;
  logVoiceJoin: string | null;
  logVoiceLeave: string | null;
  createdAt: Date;
};

const nullableString = z.string().nullable();

const GuildLogSettingValueSchema = z.compile(
  z.object({
    guildId: z.string(),
    logAntiRaid: nullableString,
    logMemberJoin: nullableString,
    logMemberLeave: nullableString,
    logMemberTimeout: nullableString,
    logMemberKick: nullableString,
    logMemberBan: nullableString,
    logMemberUnban: nullableString,
    logRoleCreate: nullableString,
    logRoleEdit: nullableString,
    logRoleDelete: nullableString,
    logChannelCreate: nullableString,
    logChannelEdit: nullableString,
    logChannelDelete: nullableString,
    logMessageEdit: nullableString,
    logMessageDelete: nullableString,
    logVoiceJoin: nullableString,
    logVoiceLeave: nullableString,
    createdAt: z.date(),
  }) satisfies z.ZodType<GuildLogSettingValue>,
);

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildLogSetting extends ExpiringValue<GuildLogSettingValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildLogSetting", TWELVE_HOURS, { schema: GuildLogSettingValueSchema });
  }
}
