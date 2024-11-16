import crypto from "crypto";

export function tokenHash(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
}
