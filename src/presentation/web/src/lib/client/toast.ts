import { toast } from "@zerodevx/svelte-toast";

// svelte-toast renders its message with {@html}, and callers interpolate attacker-controlled
// text (Discord guild names, server error content) -- escape everything here so no caller
// can turn a toast into stored XSS.
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export class Toast {
  public static success(content: string) {
    toast.push(escapeHtml(content), {
      theme: {
        "--toastColor": "mintcream",
        "--toastBackground": "rgba(72,187,120,0.9)",
        "--toastBarBackground": "#2F855A",
      },
    });
  }
  public static error(content: string) {
    toast.push(escapeHtml(content), {
      theme: {
        "--toastColor": "mintcream",
        "--toastBackground": "rgb(168, 13, 13)",
        "--toastBarBackground": "#2F855A",
      },
    });
  }
}
