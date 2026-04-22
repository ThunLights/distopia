import { core } from "./core";
import { genClient } from "infra-discord";
import { handleClient } from "presentation-bot";

export const client = handleClient(genClient(), core);
