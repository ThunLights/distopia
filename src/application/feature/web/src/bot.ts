import type { BotFeature } from "presentation-bot-kit/feature";

import { WebEditCancelButton } from "./bot/Button/WebEditCancelButton";
import { WebEditChangeButton } from "./bot/Button/WebEditChangeButton";
import { WebEditSubmitButton } from "./bot/Button/WebEditSubmitButton";
import { WebCommand } from "./bot/ChatInputCommand/WebCommand";
import { WebEditModal } from "./bot/Modal/WebEditModal";

const feature: BotFeature = {
  button: [WebEditCancelButton, WebEditChangeButton, WebEditSubmitButton],
  chatInput: [WebCommand],
  modal: [WebEditModal],
};

export default feature;
