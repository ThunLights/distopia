import { toast } from "@zerodevx/svelte-toast";

export class Toast {
	public static success(content: string) {
		toast.push(content, {
			theme: {
				"--toastColor": "mintcream",
				"--toastBackground": "rgba(72,187,120,0.9)",
				"--toastBarBackground": "#2F855A",
			}
		})
	}
	public static error(content: string) {
		toast.push(content,  {
			theme: {
				"--toastColor": "mintcream",
				"--toastBackground": "rgb(168, 13, 13)",
				"--toastBarBackground": "#2F855A",
			}
		})
	}
}
