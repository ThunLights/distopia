import type { RedisClient } from "infra-redis";
import z from "zod";

import { ExpiringValue } from "./ExpiringValue";
import type { EphemeralMemoryOwner } from "./resetEphemeralMemory";

export type GuildSettingValue = {
  guildId: string;
  actingOwner: string | null;
  bumpNotice: boolean;
  bumpNoticeRole: string | null;
  bumpNoticeContent: string | null;
  inviteLinkBlock: boolean;
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
  welcomeMessageChannel: string | null;
  welcomeMessageContent: string | null;
  leaveMessageChannel: string | null;
  leaveMessageContent: string | null;
  statChannelAllMembers: string | null;
  statChannelUsers: string | null;
  statChannelBots: string | null;
  statChannelActiveRate: string | null;
  statChannelActiveRateRanking: string | null;
  ttsDefaultSpeakerId: number | null;
  ttsSkipCommand: string;
  ttsSkipUrl: boolean;
  ttsSkipCodeBlock: boolean;
  ttsProvider: "WebVoiceVox" | "SakuraAi";
  createdAt: Date;
};

const nullableString = z.string().nullable();

const GuildSettingValueSchema = z.compile(
  z.object({
    guildId: z.string(),
    actingOwner: nullableString,
    bumpNotice: z.boolean(),
    bumpNoticeRole: nullableString,
    bumpNoticeContent: nullableString,
    inviteLinkBlock: z.boolean(),
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
    welcomeMessageChannel: nullableString,
    welcomeMessageContent: nullableString,
    leaveMessageChannel: nullableString,
    leaveMessageContent: nullableString,
    statChannelAllMembers: nullableString,
    statChannelUsers: nullableString,
    statChannelBots: nullableString,
    statChannelActiveRate: nullableString,
    statChannelActiveRateRanking: nullableString,
    ttsDefaultSpeakerId: z.number().nullable(),
    ttsSkipCommand: z.string(),
    ttsSkipUrl: z.boolean(),
    ttsSkipCodeBlock: z.boolean(),
    ttsProvider: z.enum(["WebVoiceVox", "SakuraAi"]),
    createdAt: z.date(),
  }) satisfies z.ZodType<GuildSettingValue>,
);

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildSetting extends ExpiringValue<GuildSettingValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildSetting", TWELVE_HOURS, { schema: GuildSettingValueSchema });
  }
}
