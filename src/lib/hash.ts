import { createHash } from "crypto";

export function tokenHash(content: string): string {
    return createHash("sha256").update(content).digest("hex");
}
