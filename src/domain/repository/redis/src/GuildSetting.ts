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
  ticketCategory: string | null;
  ticketRole: string | null;
  ticketLogChannel: string | null;
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
    ticketCategory: nullableString,
    ticketRole: nullableString,
    ticketLogChannel: nullableString,
    createdAt: z.date(),
  }) satisfies z.ZodType<GuildSettingValue>,
);

const TWELVE_HOURS = 12 * 60 * 60;

export class GuildSetting extends ExpiringValue<GuildSettingValue> {
  constructor(redis: RedisClient, owner: EphemeralMemoryOwner) {
    super(redis, owner, "guildSetting", TWELVE_HOURS, { schema: GuildSettingValueSchema });
  }
}
