export async function deleteAuth() {
  return await window.cookieStore.delete("authorization");
}
