import { AiEngine } from "mankai";

// Sakura Internet's AI Engine exposes a VOICEVOX-compatible TTS endpoint (audio query, then
// synthesis) -- reusing that flow lets this provider share VOICEVOX speaker IDs with
// infra-voicevox instead of needing its own voice catalog wired through the app.
export type TtsSynthesisResult =
  | { audio: Buffer; error?: undefined }
  | { audio?: undefined; error: "api_error" };

export async function synthesize(
  text: string,
  speakerId: number,
  apiKey: string,
): Promise<TtsSynthesisResult> {
  const client = new AiEngine({ apiKey });

  try {
    const audioQuery = await client.createTtsAudioQuery({ text, speaker: speakerId });
    const audio = await client.synthesizeTtsSpeech({
      speaker: speakerId,
      ttsSynthesisRequest: { ...audioQuery, kana: audioQuery.kana ?? "" },
    });
    return { audio: Buffer.from(await audio.arrayBuffer()) };
  } catch (error) {
    console.error("[sakura] TTS synthesis failed", error);
    return { error: "api_error" };
  }
}
