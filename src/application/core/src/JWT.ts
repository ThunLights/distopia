import type { Value } from "repo-memory/JWTKey";

import { Base } from "./Base";

export class JWT extends Base {
  public async genNewKey() {
    const newKey = await this.state.database.jwtKey.createNewKey();

    this.state.memory.jwtKey.set(newKey.id, {
      key: Buffer.from(newKey.key),
      alg: newKey.alg,
      createdAt: newKey.createdAt,
    });

    return newKey;
  }

  public async updateNewUserVerifyKey(userId: string) {
    const newKey = await this.state.database.userWeb.updateNewJwtVerifyKey(userId);

    this.state.memory.userJWTVerifyKey.set(newKey.id, newKey.jwtVerifyKey);

    return newKey;
  }

  public async getUserVerifyKey(userId: string) {
    return this.state.memory.userJWTVerifyKey.get(userId);
  }

  public async getCurrKey() {
    let curr: {
      id: number;
      value: Value;
    } | null = null;

    for (const [id, value] of this.state.memory.jwtKey.entries()) {
      if (!curr || id > curr.id) {
        curr = { id, value };
      }
    }

    return curr;
  }

  public async findJwtKey(id: number) {
    return this.state.memory.jwtKey.get(id);
  }

  public async findJwtKeyAll() {
    return this.state.memory.jwtKey
      .entries()
      .map(([id, { key, alg, createdAt }]) => ({ id, key, alg, createdAt }));
  }

  public async deleteJwtKey(id: number) {
    await this.state.database.jwtKey.delete(id);
    this.state.memory.jwtKey.delete(id);
  }

  public async importDB() {
    for (const { id, jwtVerifyKey } of await this.state.database.userWeb.findAll()) {
      this.state.memory.userJWTVerifyKey.set(id, jwtVerifyKey);
    }
    for (const { id, key, alg, createdAt } of await this.state.database.jwtKey.findAll()) {
      this.state.memory.jwtKey.set(id, { key: Buffer.from(key), alg, createdAt });
    }
    if ((await this.getCurrKey()) === null) {
      await this.genNewKey();
    }
  }

  public async update() {
    const currKey = await this.getCurrKey();

    if (currKey) {
      if (Date.now() > currKey.value.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) {
        await this.genNewKey();
      }
    } else {
      await this.genNewKey();
    }

    for (const { id, createdAt } of await this.findJwtKeyAll()) {
      if (Date.now() > createdAt.getTime() + 365 * 24 * 60 * 60 * 1000) {
        await this.deleteJwtKey(id);
      }
    }
  }
}
