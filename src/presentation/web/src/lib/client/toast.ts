import { toast } from "svelte-sonner";

export class Toast {
  public static success(content: string) {
    toast.success(content);
  }
  public static error(content: string) {
    toast.error(content);
  }
}
