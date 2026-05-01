import { core } from "./core";
import { Controller, genClient } from "infra-discord";
import { handleClient } from "presentation-bot";

export const client = handleClient(genClient(), core);

export const controller = new Controller(client);
