import type { AppState } from "./AppState";

export class Base {
  constructor(public readonly state: AppState) {}
}
