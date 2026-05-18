// See https://svelte.dev/docs/kit/types#app.d.ts
import type { UserAuth } from "$lib/shared/types/UserAuth";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: UserAuth | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
