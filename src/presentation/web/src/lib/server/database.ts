import { env } from "$env/dynamic/private";
import { genDatabaseClient } from "infra-database";

// Falls back to composing the URL from separate DB_* parts (k8s injects these instead of
// a single DATABASE_URL) so no connection-string-shaped literal has to exist in any
// manifest -- that shape trips secret scanners even when the credential fields are just
// placeholders, not real values.
const databaseUrl =
  env.DATABASE_URL ??
  `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

export const database = genDatabaseClient(databaseUrl);
