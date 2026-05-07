import type { JWTKey } from "infra-database/types";

import type { AppState } from "./AppState";
import { Base } from "./Base";

export class JWT extends Base {
  constructor(state: AppState) {
    (async () => {
      for (const { id, jwtVerifyId } of await this.state.database.userWeb.findAll()) {
        this.state.memory.userJWTVerifyKey.set(id, jwtVerifyId);
      }
      for (const { id, key } of await this.state.database.jwtKey.findAll()) {
        this.state.memory.jwtKey.set(id.toString(), Buffer.from(key));
      }
    })();
    super(state);
  }

  public async findAll(): Promise<JWTKey[]> {
    return await this.state.database.jwtKey.findAll();
  }

  public async createNewKey() {
    return await this.state.database.jwtKey.createNewKey();
  }

  public async delete(id: number) {
    return await this.state.database.jwtKey.delete(id);
  }
}
