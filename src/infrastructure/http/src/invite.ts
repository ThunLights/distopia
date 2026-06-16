export async function isUsedCf(response: Response) {
  try {
    const { JSDOM } = await import("jsdom");
    const html = await response.text();
    const jsdom = new JSDOM(html);
    const title = jsdom.window.document.querySelector("title");
    return title ? title.textContent === "Just a moment..." : false;
  } catch {
    return false;
  }
}

export async function isInviteLink(url: string) {
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  return {
    content: response.url.startsWith("https://discord.com/invite/"),
    isUsedCf: await isUsedCf(response),
  };
}
