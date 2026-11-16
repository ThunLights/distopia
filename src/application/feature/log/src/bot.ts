import type { BotFeature } from "presentation-bot-kit/feature";

import { BackLogPageButton } from "./bot/Button/BackLogPageButton";
import { LogBulkClearButton } from "./bot/Button/LogBulkClearButton";
import { LogBulkSetButton } from "./bot/Button/LogBulkSetButton";
import { LogChannelResetButton } from "./bot/Button/LogChannelResetButton";
import { LogBulkSetChannelSelectMenu } from "./bot/ChannelSelectMenu/LogBulkSetChannelSelectMenu";
import { LogChannelSelectMenu } from "./bot/ChannelSelectMenu/LogChannelSelectMenu";
import { channelCreate } from "./bot/Event/ChannelCreate";
import { channelDelete } from "./bot/Event/ChannelDelete";
import { channelUpdate } from "./bot/Event/ChannelUpdate";
import { guildBanAdd } from "./bot/Event/GuildBanAdd";
import { guildBanRemove } from "./bot/Event/GuildBanRemove";
import { guildMemberAdd } from "./bot/Event/GuildMemberAdd";
import { guildMemberRemove } from "./bot/Event/GuildMemberRemove";
import { guildMemberUpdate } from "./bot/Event/GuildMemberUpdate";
import { messageDelete } from "./bot/Event/MessageDelete";
import { messageUpdate } from "./bot/Event/MessageUpdate";
import { roleCreate } from "./bot/Event/RoleCreate";
import { roleDelete } from "./bot/Event/RoleDelete";
import { roleUpdate } from "./bot/Event/RoleUpdate";
import { voiceStateUpdate } from "./bot/Event/VoiceStateUpdate";
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
  events: {
    channelCreate,
    channelDelete,
    channelUpdate,
    guildBanAdd,
    guildBanRemove,
    guildMemberAdd,
    guildMemberRemove,
    guildMemberUpdate,
    messageDelete,
    messageUpdate,
    roleCreate,
    roleDelete,
    roleUpdate,
    voiceStateUpdate,
  },
};

export default feature;
