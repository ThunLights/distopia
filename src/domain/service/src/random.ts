import { useAsync } from "./async";

export const randomStringSync = (
  n: number,
  s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
): string =>
  Array.from(Array(n))
    .map(() => s[Math.floor(Math.random() * s.length)])
    .join("");

export const randomNumberSync = (n: number, s = "0123456789"): number =>
  Number(
    Array.from(Array(n))
      .map(() => s[Math.floor(Math.random() * s.length)])
      .join(""),
  );

export const randomString = useAsync(randomStringSync);

export const randomNumber = useAsync(randomNumberSync);
