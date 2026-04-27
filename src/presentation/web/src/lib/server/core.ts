import { PUBLIC_OWNER_ID, PUBLIC_URL } from "$env/static/public";
import { database } from "./database";
import { client } from "./discord";
import { memory } from "./memory";
import { AppCore } from "app-core";
import { Controller } from "infra-discord";

export const core = new AppCore({
  owner: { id: PUBLIC_OWNER_ID },
  url: PUBLIC_URL,
  memory,
  discord: new Controller(client),
  database,
});
