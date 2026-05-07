export async function setAuth(token: string) {
  return await cookieStore.set({
    name: "auth",
    value: token,
    expires: 2 * 30 * 24 * 60 * 60 * 1000,
  });
}

export async function deleteAuth() {
  return await cookieStore.delete("auth");
}
