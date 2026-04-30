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
