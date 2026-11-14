import type { BotFeature } from "presentation-bot-kit/feature";

import { TicketClaimButton } from "./bot/Button/TicketClaimButton";
import { TicketCloseButton } from "./bot/Button/TicketCloseButton";
import { TicketCloseConfirmButton } from "./bot/Button/TicketCloseConfirmButton";
import { TicketMembersButton } from "./bot/Button/TicketMembersButton";
import { TicketOpenButton } from "./bot/Button/TicketOpenButton";
import { TicketPanelButton } from "./bot/Button/TicketPanelButton";
import { TicketResetButton } from "./bot/Button/TicketResetButton";
import { TicketCategorySelectMenu } from "./bot/ChannelSelectMenu/TicketCategorySelectMenu";
import { TicketLogChannelSelectMenu } from "./bot/ChannelSelectMenu/TicketLogChannelSelectMenu";
import { TicketOpenModal } from "./bot/Modal/TicketOpenModal";
import { TicketPanelModal } from "./bot/Modal/TicketPanelModal";
import { ticketPage } from "./bot/Page/TicketPage";
import { TicketRoleSelectMenu } from "./bot/RoleSelectMenu/TicketRoleSelectMenu";
import { TicketMemberSelectMenu } from "./bot/UserSelectMenu/TicketMemberSelectMenu";

const feature: BotFeature = {
  button: [
    TicketClaimButton,
    TicketCloseButton,
    TicketCloseConfirmButton,
    TicketMembersButton,
    TicketOpenButton,
    TicketPanelButton,
    TicketResetButton,
  ],
  channelSelectMenu: [TicketCategorySelectMenu, TicketLogChannelSelectMenu],
  modal: [TicketOpenModal, TicketPanelModal],
  roleSelectMenu: [TicketRoleSelectMenu],
  userSelectMenu: [TicketMemberSelectMenu],
  settings: [{ label: "チケット設定", value: "ticket", page: ticketPage }],
};

export default feature;
