import { useAsync } from "./async";

export type Score = {
  level: bigint;
  point: bigint;
};

export function levelUpSync(level: bigint, point: bigint, plus: bigint): Score {
  const nextLvPt = level ** 2n;
  const ptSum = point + plus;

  if (nextLvPt <= ptSum) {
    const remaining = ptSum - nextLvPt;
    return levelUpSync(level + 1n, remaining, 0n);
  }

  return {
    level,
    point: ptSum,
  };
}

export const levelUp = useAsync(levelUpSync);

export function levelProgress({ point, nextPoint }: { point: bigint; nextPoint: bigint }): number {
  if (nextPoint <= 0n) {
    return 0;
  }
  return Math.max(0, Math.min(Number(point) / Number(nextPoint), 1));
}

export function formatRank(rank: number | null): string {
  return rank === null ? "-" : `#${rank.toLocaleString()}`;
}
