import { PUBLIC_OWNER_ID, PUBLIC_URL } from "$env/static/public";
import { djsController } from "./bot";
import { database } from "./database";
import { memory } from "./memory";
import { AppCore } from "app-core";
import type { AppState } from "app-core/AppState";

export function genCore(state: AppState) {
  return new AppCore(state);
}

export const core = genCore({
  owner: { id: PUBLIC_OWNER_ID },
  url: PUBLIC_URL,
  memory,
  discord: djsController,
  database,
});
