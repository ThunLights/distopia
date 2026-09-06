// A curated subset of VOICEVOX speakers/styles (well-known characters only, e.g. ずんだもん)
// rather than the full catalog (100+ speaker/style combinations) -- Discord command option
// `choices` are capped at 25 entries, and a shorter, recognizable list is friendlier to pick
// from than a wall of unfamiliar names anyway. IDs match VOICEVOX's standard speaker
// numbering, unchanged since early engine versions.
export const FAMOUS_SPEAKERS = [
  { name: "四国めたん (ノーマル)", value: 2 },
  { name: "ずんだもん (ノーマル)", value: 3 },
  { name: "春日部つむぎ (ノーマル)", value: 8 },
  { name: "波音リツ (ノーマル)", value: 9 },
  { name: "雨晴はう (ノーマル)", value: 10 },
  { name: "玄野武宏 (ノーマル)", value: 11 },
  { name: "白上虎太郎 (ノーマル)", value: 12 },
  { name: "青山龍星 (ノーマル)", value: 13 },
  { name: "冥鳴ひまり (ノーマル)", value: 14 },
  { name: "九州そら (ノーマル)", value: 16 },
] as const;

export function speakerName(speakerId: number): string {
  return (
    FAMOUS_SPEAKERS.find((speaker) => speaker.value === speakerId)?.name ?? `話者ID ${speakerId}`
  );
}
