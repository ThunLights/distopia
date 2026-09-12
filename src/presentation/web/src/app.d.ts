import type { UserAuth } from "$lib/shared/types/UserAuth";

declare global {
  namespace App {
    interface Locals {
      user: UserAuth | null;
    }
  }
}

export {};
