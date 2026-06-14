import type { SafeUrl } from "./safeurl";

export async function safeFetch(input: SafeUrl, init?: RequestInit): Promise<Response> {
  return await fetch(input, init);
}
