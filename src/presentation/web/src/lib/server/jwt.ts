import { JWTClient } from "./JWTClient";
import { core } from "./core";

export const jwt = new JWTClient();

async function genNewKey() {
  const newKey = await core.jwt.createNewKey();
  const { key, alg, createdAt } = newKey;
  await jwt.setKey(newKey.id, { key: Buffer.from(key), alg, createdAt });
}

export async function importJwtKeys() {
  for (const { id, key, alg, createdAt } of await core.jwt.findAll()) {
    await jwt.setKey(id, { key: Buffer.from(key), alg, createdAt });
  }
  if ((await jwt.getCurrKey()) === null) {
    await genNewKey();
  }
}

export async function updateJWTKeys() {
  for (const { id, createdAt } of await core.jwt.findAll()) {
    if (Date.now() > createdAt.getTime() + 365 * 24 * 60 * 60 * 1000) {
      await jwt.deleteKey(id);
      await core.jwt.delete(id);
    }
  }
  const currKey = await jwt.getCurrKey();
  if (currKey) {
    if (Date.now() > currKey.value.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) {
      await genNewKey();
    }
  } else {
    await genNewKey();
  }
}
