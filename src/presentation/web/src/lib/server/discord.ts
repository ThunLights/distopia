import { PUBLIC_OWNER_ID } from "$env/static/public";
import { genClient } from "infra-discord";
import { handleClient } from "presentation-bot";
import { database } from "./database";

export const client = handleClient(genClient(), { owner: { id: PUBLIC_OWNER_ID }, database });
