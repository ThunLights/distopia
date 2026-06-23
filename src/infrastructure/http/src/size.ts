export const MAX_BYTES = 1024 * 1024; // 1MB

export async function isValidSize(response: Response) {
  const body = response.body;

  if (body === null) {
    return true;
  }

  const reader = body.getReader();
  let received = 0;
  let isOk = true;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    received += value.byteLength;

    if (received > MAX_BYTES) {
      await reader.cancel();
      isOk = false;
    }
  }

  return isOk;
}
