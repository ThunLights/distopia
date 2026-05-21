import { randomBytes, createCipheriv, createDecipheriv, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

let encryptionKey: Buffer | null = null;

export function isEncryptionEnabled(): boolean {
  return encryptionKey !== null;
}

export function setEncryptionKey(key: string): void {
  encryptionKey = createHash("sha256").update(key).digest();
}

function getKey(): Buffer {
  if (!encryptionKey) {
    throw new Error("ENCRYPTION_KEY is not configured");
  }
  return encryptionKey;
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns the encrypted data in format "iv:authTag:ciphertext" (hex-encoded),
 * or the original plaintext prefixed with "unencrypted:" if no key is configured.
 */
export function encrypt(plaintext: string): string {
  if (!encryptionKey) {
    return `unencrypted:${plaintext}`;
  }

  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  // Format: iv:authTag:encryptedData
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a string that was encrypted with `encrypt()`.
 * Also handles unencrypted data (backward compatibility).
 */
export function decrypt(encryptedData: string): string {
  // Handle unencrypted fallback
  if (encryptedData.startsWith("unencrypted:")) {
    return encryptedData.slice("unencrypted:".length);
  }

  const key = getKey();
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
