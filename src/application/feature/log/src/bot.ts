import type { BotFeature } from "presentation-bot-kit/feature";

import { BackLogPageButton } from "./bot/Button/BackLogPageButton";
import { LogBulkClearButton } from "./bot/Button/LogBulkClearButton";
import { LogBulkSetButton } from "./bot/Button/LogBulkSetButton";
import { LogChannelResetButton } from "./bot/Button/LogChannelResetButton";
import { LogBulkSetChannelSelectMenu } from "./bot/ChannelSelectMenu/LogBulkSetChannelSelectMenu";
import { LogChannelSelectMenu } from "./bot/ChannelSelectMenu/LogChannelSelectMenu";
import { ChannelCreateEvent } from "./bot/Event/ChannelCreate";
import { ChannelDeleteEvent } from "./bot/Event/ChannelDelete";
import { ChannelUpdateEvent } from "./bot/Event/ChannelUpdate";
import { GuildBanAddEvent } from "./bot/Event/GuildBanAdd";
import { GuildBanRemoveEvent } from "./bot/Event/GuildBanRemove";
import { GuildMemberAddEvent } from "./bot/Event/GuildMemberAdd";
import { GuildMemberRemoveEvent } from "./bot/Event/GuildMemberRemove";
import { GuildMemberUpdateEvent } from "./bot/Event/GuildMemberUpdate";
import { MessageDeleteEvent } from "./bot/Event/MessageDelete";
import { MessageUpdateEvent } from "./bot/Event/MessageUpdate";
import { RoleCreateEvent } from "./bot/Event/RoleCreate";
import { RoleDeleteEvent } from "./bot/Event/RoleDelete";
import { RoleUpdateEvent } from "./bot/Event/RoleUpdate";
import { VoiceStateUpdateEvent } from "./bot/Event/VoiceStateUpdate";
import { logPage } from "./bot/Page/LogPage";
import { LogBulkClearFieldsSelectMenu } from "./bot/StringSelectMenu/LogBulkClearFieldsSelectMenu";
import { LogBulkSetFieldsSelectMenu } from "./bot/StringSelectMenu/LogBulkSetFieldsSelectMenu";
import { LogCategorySelectMenu } from "./bot/StringSelectMenu/LogCategorySelectMenu";

const feature: BotFeature = {
  button: [BackLogPageButton, LogBulkClearButton, LogBulkSetButton, LogChannelResetButton],
  channelSelectMenu: [LogBulkSetChannelSelectMenu, LogChannelSelectMenu],
  stringSelectMenu: [
    LogBulkClearFieldsSelectMenu,
    LogBulkSetFieldsSelectMenu,
    LogCategorySelectMenu,
  ],
  settings: [{ label: "ログ設定", value: "log", page: logPage }],
  events: [
    ChannelCreateEvent,
    ChannelDeleteEvent,
    ChannelUpdateEvent,
    GuildBanAddEvent,
    GuildBanRemoveEvent,
    GuildMemberAddEvent,
    GuildMemberRemoveEvent,
    GuildMemberUpdateEvent,
    MessageDeleteEvent,
    MessageUpdateEvent,
    RoleCreateEvent,
    RoleDeleteEvent,
    RoleUpdateEvent,
    VoiceStateUpdateEvent,
  ],
};

export default feature;
