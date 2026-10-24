import { createCanvas, loadImage, type SKRSContext2D } from "@napi-rs/canvas";
import type { RankCard, RankCardRenderer } from "domain-model";
import { formatRank, levelProgress } from "domain-service";
import { safeFetch, validateSafeUrl } from "infra-http";

const WIDTH = 934;
const HEIGHT = 320;
// Needs a CJK-capable system font (fonts-noto-cjk in the Docker images); the later families
// are only fallbacks so a bare host still draws Latin text instead of failing.
const FONT = '"Noto Sans CJK JP", "Noto Sans JP", "WenQuanYi Zen Hei", sans-serif';

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

  const avatar = await loadAvatar(input.avatarUrl);
  ctx.save();
  ctx.beginPath();
  ctx.arc(110, 110, 70, 0, Math.PI * 2);
  ctx.clip();
  if (avatar) {
    ctx.drawImage(avatar, 40, 40, 140, 140);
  } else {
    ctx.fillStyle = "#5865f2";
    ctx.fillRect(40, 40, 140, 140);
  }
  ctx.restore();

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

export class CanvasRankCardRenderer implements RankCardRenderer {
  public render(card: RankCard): Promise<Uint8Array> {
    return draw(card);
  }
}
