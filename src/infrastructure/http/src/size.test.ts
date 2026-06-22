import { describe, expect, it, vi } from "vitest";

import { isValidSize, MAX_BYTES } from "./size";

/**
 * Build a stream that emits the given byte counts as separate chunks.
 * Accepts an optional cancel spy that fires when the stream is cancelled.
 */
function makeStream(chunkSizes: number[], onCancel?: () => void): ReadableStream<Uint8Array> {
  const queue = [...chunkSizes];
  return new ReadableStream<Uint8Array>({
    pull(controller) {
      const size = queue.shift();
      if (size === undefined) {
        controller.close();
      } else {
        controller.enqueue(new Uint8Array(size));
      }
    },
    cancel() {
      onCancel?.();
    },
  });
}

describe("isValidSize", () => {
  it("returns true when body is null", async () => {
    const res = new Response(null);
    expect(res.body).toBeNull(); // sanity-check the precondition
    expect(await isValidSize(res)).toBe(true);
  });

  it("returns true for an empty body (0 bytes)", async () => {
    const res = new Response(makeStream([]));
    expect(await isValidSize(res)).toBe(true);
  });

  it("returns true when under MAX_BYTES", async () => {
    const res = new Response(makeStream([100]));
    expect(await isValidSize(res)).toBe(true);
  });

  it("returns true at exactly MAX_BYTES (boundary)", async () => {
    const res = new Response(makeStream([MAX_BYTES]));
    expect(await isValidSize(res)).toBe(true);
  });

  it("returns false at MAX_BYTES + 1 (boundary)", async () => {
    const res = new Response(makeStream([MAX_BYTES + 1]));
    expect(await isValidSize(res)).toBe(false);
  });

  it("returns false when chunks sum past MAX_BYTES", async () => {
    const half = MAX_BYTES / 2;
    // total = MAX_BYTES + 1, i.e. over the limit
    const res = new Response(makeStream([half, half, 1]));
    expect(await isValidSize(res)).toBe(false);
  });

  it("returns true when chunks sum within the limit", async () => {
    const third = Math.floor(MAX_BYTES / 3);
    // total <= MAX_BYTES
    const res = new Response(makeStream([third, third, third]));
    expect(await isValidSize(res)).toBe(true);
  });

  it("calls cancel on the stream when exceeded", async () => {
    const onCancel = vi.fn();
    const res = new Response(makeStream([MAX_BYTES + 1], onCancel));
    expect(await isValidSize(res)).toBe(false);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("stops reading remaining chunks once exceeded", async () => {
    const pulled: number[] = [];
    let i = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled.push(i);
        if (i === 0) {
          controller.enqueue(new Uint8Array(MAX_BYTES + 1)); // exceeds here
        } else {
          // a later chunk we don't expect to reach
          controller.enqueue(new Uint8Array(10));
        }
        i += 1;
      },
    });
    const res = new Response(stream);

    expect(await isValidSize(res)).toBe(false);
    // cancelled on the first over-limit chunk, so pull runs only once
    expect(pulled).toEqual([0]);
  });
});
