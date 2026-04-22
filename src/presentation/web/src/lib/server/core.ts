import { PUBLIC_OWNER_ID } from "$env/static/public";
import { database } from "./database";
import { memory } from "./memory";
import { schedule } from "./schedule";
import { AppCore } from "app-core";
import { getPublicConstants } from "app-core/constant";

export const core = new AppCore({
  owner: { id: PUBLIC_OWNER_ID },
  memory,
  database,
  schedule,
  constants: getPublicConstants(),
});
