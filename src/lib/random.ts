export const randomString = (n: number, s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"): string => Array.from(Array(n)).map(() => s[Math.floor(Math.random()*s.length)]).join("")
export const randomNumber = (n: number, s = "0123456789"): number => Number(Array.from(Array(n)).map(() => s[Math.floor(Math.random()*s.length)]).join(""))
