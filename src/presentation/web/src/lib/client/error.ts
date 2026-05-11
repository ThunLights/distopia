import { Toast } from "./toast";

export async function parseErrRes(response: Response) {
  const { content } = await response.json();
  Toast.error(`エラー「${content}」`);
}
