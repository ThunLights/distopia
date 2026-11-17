import { features } from "app-feature-loader/bot";
import { addSettings } from "presentation-bot-kit/settings";

export function registerSettings() {
  addSettings(...features.flatMap((feature) => feature.settings ?? []));
}
