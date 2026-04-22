import { PUBLIC_OWNER_ID } from "$env/static/public";
import { database } from "./database";
import { memory } from "./memory";
import { AppCore } from "app-core";

export const core = new AppCore({
  owner: { id: PUBLIC_OWNER_ID },
  memory,
  database,
});
