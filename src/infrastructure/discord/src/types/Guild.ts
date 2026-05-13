export type Guild = {
  readonly id: string;
  name: string;
  ownerId: string;
  description?: string;
  icon?: string;
  banner?: string;
  iconUrl?: string;
  bannerUrl?: string;
};
