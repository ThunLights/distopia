import type { BotFeature } from "presentation-bot-kit/feature";

import { BackStickyMessagePageButton } from "./bot/Button/BackStickyMessagePageButton";
import { StickyMessageContentSubmitButton } from "./bot/Button/StickyMessageContentSubmitButton";
import { StickyMessageDeleteButton } from "./bot/Button/StickyMessageDeleteButton";
import { StickyMessageChannelSelectMenu } from "./bot/ChannelSelectMenu/StickyMessageChannelSelectMenu";
import { MessageCreateEvent } from "./bot/Event/MessageCreate";
import { StickyMessageContentModal } from "./bot/Modal/StickyMessageContentModal";
import { stickyMessagePage } from "./bot/Page/StickyMessagePage";

const feature: BotFeature = {
  button: [
    BackStickyMessagePageButton,
    StickyMessageContentSubmitButton,
    StickyMessageDeleteButton,
  ],
  channelSelectMenu: [StickyMessageChannelSelectMenu],
  modal: [StickyMessageContentModal],
  settings: [{ label: "ピン止めメッセージ設定", value: "stickyMessage", page: stickyMessagePage }],
  events: [MessageCreateEvent],
};

export default feature;
