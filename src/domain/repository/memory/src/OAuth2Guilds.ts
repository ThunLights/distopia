import { MapWithGC } from "./MapWithGC";

export type Guilds = {
  id: string;
  name: string;
  icon: string | null;
  banner: string | null;
  owner: boolean;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  isBotJoined: boolean;
  isPublic: boolean;
}[];

export class OAuth2Guilds extends MapWithGC<string, Guilds> {
  public override gc(): void {
    this.clear();
  }
}
