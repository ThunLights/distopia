import { afterEach, describe, expect, test, vi } from "vitest";

const createTtsAudioQuery = vi.fn();
const synthesizeTtsSpeech = vi.fn();

vi.mock("mankai", () => ({
  AiEngine: class {
    createTtsAudioQuery = createTtsAudioQuery;
    synthesizeTtsSpeech = synthesizeTtsSpeech;
  },
}));

import { synthesize } from "./synthesize";

afterEach(() => {
  vi.clearAllMocks();
});

describe("synthesize", () => {
  test("returns audio bytes on success", async () => {
    createTtsAudioQuery.mockResolvedValue({ kana: "ハロー" });
    synthesizeTtsSpeech.mockResolvedValue(new Blob([new Uint8Array([1, 2, 3])]));

    const result = await synthesize("hello", 3, "fake-key");

    expect(result.error).toBeUndefined();
    expect(result.audio).toEqual(Buffer.from([1, 2, 3]));
    expect(synthesizeTtsSpeech).toHaveBeenCalledWith({
      speaker: 3,
      ttsSynthesisRequest: { kana: "ハロー" },
    });
  });

  test("falls back to an empty kana when the audio query omits it", async () => {
    createTtsAudioQuery.mockResolvedValue({});
    synthesizeTtsSpeech.mockResolvedValue(new Blob([new Uint8Array([9])]));

    await synthesize("hello", 1, "fake-key");

    expect(synthesizeTtsSpeech).toHaveBeenCalledWith({
      speaker: 1,
      ttsSynthesisRequest: { kana: "" },
    });
  });

  test("reports api_error when the audio query request throws", async () => {
    createTtsAudioQuery.mockRejectedValue(new Error("network down"));

    const result = await synthesize("hello", 3, "fake-key");

    expect(result.error).toBe("api_error");
  });

  test("reports api_error when synthesis itself throws", async () => {
    createTtsAudioQuery.mockResolvedValue({ kana: "ハロー" });
    synthesizeTtsSpeech.mockRejectedValue(new Error("network down"));

    const result = await synthesize("hello", 3, "fake-key");

    expect(result.error).toBe("api_error");
  });
});
