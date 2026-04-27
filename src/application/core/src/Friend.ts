import type { FriendUpsertInput } from "infra-database/types";

import { Base } from "./Base";

export class Friend extends Base {
  public async save(input: FriendUpsertInput) {
    return await this.state.database.friend.upsert(input);
  }
}
