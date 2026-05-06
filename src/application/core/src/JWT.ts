import type { JWTKey } from "infra-database/types";

import { Base } from "./Base";

export class JWT extends Base {
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
