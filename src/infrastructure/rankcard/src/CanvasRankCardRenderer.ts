import { createCanvas, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import type { LeaderboardCard, LeaderboardRow, RankCard, RankCardRenderer } from "domain-model";
import { formatRank, levelProgress } from "domain-service";
import { safeFetch, validateSafeUrl } from "infra-http";

const WIDTH = 934;
const HEIGHT = 320;
const LEADERBOARD_HEADER = 116;
const LEADERBOARD_ROW = 64;
// Discord names mix CJK, symbols, math alphanumerics (𝓐), emoji and other scripts. Skia only
// falls back through this list (not to every installed font), so a script renders only if its
// family is named here — this covers the scripts commonly seen in names, not all of fonts-noto-core (fonts-noto-cjk / fonts-noto-core / fonts-noto-color-emoji in the Docker images).
const FONT = [
  "Noto Sans CJK JP",
  "Noto Sans",
  "Noto Sans Symbols",
  "Noto Sans Symbols2",
  "Noto Sans Math",
  "Noto Color Emoji",
  "Noto Sans Thai",
  "Noto Sans Arabic",
  "Noto Sans Hebrew",
  "Noto Sans Devanagari",
  "Noto Sans Bengali",
  "Noto Sans Gurmukhi",
  "Noto Sans Gujarati",
  "Noto Sans Oriya",
  "Noto Sans Tamil",
  "Noto Sans Telugu",
  "Noto Sans Kannada",
  "Noto Sans Malayalam",
  "Noto Sans Sinhala",
  "Noto Sans Khmer",
  "Noto Sans Lao",
  "Noto Sans Myanmar",
  "Noto Sans Armenian",
  "Noto Sans Georgian",
  "Noto Sans Ethiopic",
  "Noto Sans Cherokee",
  "Noto Sans Canadian Aboriginal",
  "Noto Sans Javanese",
  "Noto Serif Tibetan",
  "Noto Sans Runic",
  "Noto Sans Yi",
  "WenQuanYi Zen Hei",
]
  .map((family) => `"${family}"`)
  .concat("sans-serif")
  .join(", ");

async function loadAvatar(url: string) {
  const safe = validateSafeUrl(url);
  if (safe === null) {
    return null;
  }

  const res = await safeFetch(safe);
  if (res instanceof Error || !res.ok) {
    return null;
  }

  try {
    return await loadImage(Buffer.from(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

function circleAvatar(
  ctx: SKRSContext2D,
  avatar: Awaited<ReturnType<typeof loadAvatar>>,
  x: number,
  y: number,
  size: number,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  if (avatar) {
    ctx.drawImage(avatar, x, y, size, size);
  } else {
    ctx.fillStyle = "#5865f2";
    ctx.fillRect(x, y, size, size);
  }
  ctx.restore();
}

function fit(ctx: SKRSContext2D, text: string, maxWidth: number) {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }

  let shortened = text;
  while (shortened.length > 1 && ctx.measureText(`${shortened}…`).width > maxWidth) {
    shortened = shortened.slice(0, -1);
  }
  return `${shortened}…`;
}

function bar(
  ctx: SKRSContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  ratio: number,
  color: string,
) {
  ctx.fillStyle = "#3b3f45";
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, height / 2);
  ctx.fill();

  if (ratio > 0) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, Math.max(height, width * Math.min(ratio, 1)), height, height / 2);
    ctx.fill();
  }
}

async function draw(input: RankCard): Promise<Buffer> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1e2124";
  ctx.beginPath();
  ctx.roundRect(0, 0, WIDTH, HEIGHT, 28);
  ctx.fill();

  circleAvatar(ctx, await loadAvatar(input.avatarUrl), 40, 40, 140);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 40px ${FONT}`;
  ctx.fillText(fit(ctx, input.name, 700), 220, 78);

  // Main block: this server.
  ctx.fillStyle = "#99aab5";
  ctx.font = `600 22px ${FONT}`;
  ctx.fillText(fit(ctx, input.guildName, 360), 220, 114);

  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 34px ${FONT}`;
  const levelText = `LEVEL ${input.guild.level}`;
  ctx.fillText(levelText, 890, 150);
  const levelWidth = ctx.measureText(levelText).width;
  ctx.fillStyle = "#faa61a";
  ctx.fillText(`RANK ${formatRank(input.guild.rank)}`, 890 - levelWidth - 28, 150);

  bar(ctx, 220, 170, 670, 34, levelProgress(input.guild), "#5865f2");
  ctx.textAlign = "right";
  ctx.fillStyle = "#99aab5";
  ctx.font = `600 20px ${FONT}`;
  ctx.fillText(`${input.guild.point} / ${input.guild.nextPoint} XP`, 890, 232);

  // Sub block: global.
  ctx.fillStyle = "#2b2f33";
  ctx.beginPath();
  ctx.roundRect(24, 252, WIDTH - 48, 48, 14);
  ctx.fill();

  ctx.textAlign = "left";
  ctx.fillStyle = "#99aab5";
  ctx.font = `700 20px ${FONT}`;
  ctx.fillText("GLOBAL", 44, 283);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(`RANK ${formatRank(input.global.rank)}`, 140, 283);
  ctx.fillText(`LEVEL ${input.global.level}`, 290, 283);

  bar(ctx, 430, 268, 330, 16, levelProgress(input.global), "#3ba55d");
  ctx.textAlign = "right";
  ctx.fillStyle = "#99aab5";
  ctx.font = `600 18px ${FONT}`;
  ctx.fillText(`${input.global.point} / ${input.global.nextPoint}`, 906, 283);

  return canvas.toBuffer("image/png");
}

async function drawLeaderboard({ guildName, top, self }: LeaderboardCard): Promise<Buffer> {
  const rows: (LeaderboardRow & { isSelf: boolean })[] = [
    ...top.map((row) => ({ ...row, isSelf: false })),
    ...(self ? [{ ...self, isSelf: true }] : []),
  ];
  const avatars = await Promise.all(rows.map(({ avatarUrl }) => loadAvatar(avatarUrl)));

  const height = LEADERBOARD_HEADER + rows.length * LEADERBOARD_ROW + 24;
  const canvas = createCanvas(WIDTH, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#1e2124";
  ctx.beginPath();
  ctx.roundRect(0, 0, WIDTH, height, 28);
  ctx.fill();

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText("LEADERBOARD", 40, 60);
  ctx.fillStyle = "#99aab5";
  ctx.font = `600 22px ${FONT}`;
  ctx.fillText(fit(ctx, guildName, WIDTH - 80), 40, 92);

  ctx.textBaseline = "middle";
  rows.forEach(({ name, level, rank, isSelf }, index) => {
    const y = LEADERBOARD_HEADER + index * LEADERBOARD_ROW;
    const center = y + (LEADERBOARD_ROW - 8) / 2;

    ctx.fillStyle = isSelf ? "#3b3f45" : "#2b2f33";
    ctx.beginPath();
    ctx.roundRect(24, y, WIDTH - 48, LEADERBOARD_ROW - 8, 14);
    ctx.fill();

    ctx.textAlign = "left";
    ctx.fillStyle = "#faa61a";
    ctx.font = `700 24px ${FONT}`;
    ctx.fillText(formatRank(rank), 44, center);

    circleAvatar(ctx, avatars[index] ?? null, 140, center - 24, 48);

    ctx.fillStyle = "#ffffff";
    ctx.font = `600 24px ${FONT}`;
    ctx.fillText(fit(ctx, name, 520), 204, center);

    ctx.textAlign = "right";
    ctx.font = `700 24px ${FONT}`;
    ctx.fillText(`LEVEL ${level}`, 890, center);
  });

  return canvas.toBuffer("image/png");
}

export class CanvasRankCardRenderer implements RankCardRenderer {
  public render(card: RankCard): Promise<Uint8Array> {
    return draw(card);
  }

  public renderLeaderboard(card: LeaderboardCard): Promise<Uint8Array> {
    return drawLeaderboard(card);
  }
}
