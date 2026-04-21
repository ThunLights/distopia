import { PUBLIC_OWNER_ID } from "$env/static/public";
import { database } from "./database";
import { genClient } from "infra-discord";
import { handleClient } from "presentation-bot";

export const client = handleClient(genClient(), { owner: { id: PUBLIC_OWNER_ID }, database });
