export type Guild = {
  readonly id: string;
  name: string;
  ownerId: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
};
