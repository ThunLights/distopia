import { JWTClient } from "./JWTClient";
import { core } from "./core";

export const jwt = new JWTClient();

export async function importJwtKeys() {
  for (const { id, key, alg } of await core.jwt.findAll()) {
    await jwt.setKey(id, { key: Buffer.from(key), alg });
  }
  if (await jwt.getCurrKey()) {
    const newKey = await core.jwt.createNewKey();
    await jwt.setKey(newKey.id, { key: Buffer.from(newKey.key), alg: newKey.alg });
  }
}
