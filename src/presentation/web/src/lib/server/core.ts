import { PUBLIC_OWNER_ID, PUBLIC_URL } from "$env/static/public";
import { database } from "./database";
import { memory } from "./memory";
import { AppCore } from "app-core";
import { getPublicConstants } from "app-core/constant";

export const core = new AppCore({
  owner: { id: PUBLIC_OWNER_ID },
  url: PUBLIC_URL,
  memory,
  database,
  constants: getPublicConstants(),
});
