export type SupporterServer = {
  name: string;
  invite: string;
};

export type Staff = {
  readonly name: string;
  readonly description: string;
  readonly discordId: string;
  readonly links: readonly {
    readonly url: string;
  }[];
};

export const supportersKeyValue = {
  bread: {
    name: "クリームパンと愉快な仲間たち",
    invite: "https://discord.gg/De8T2NS74X",
  },
  mikan: {
    name: "Mikan Soba Club",
    invite: "https://discord.gg/HaFhCWS2Kk",
  },
  cappuccino: {
    name: "Cappuccino",
    invite: "https://discord.gg/cappuccino",
  },
  hima: {
    name: "暇人鯖",
    invite: "https://discord.gg/hima",
  },
  lemon: {
    name: "大檸檬帝国",
    invite: "https://discord.gg/BgZddsVPMH",
  },
};

export const supporters = [
  supportersKeyValue.bread,
  supportersKeyValue.mikan,
  supportersKeyValue.cappuccino,
  supportersKeyValue.hima,
  supportersKeyValue.lemon,
] as const satisfies Array<SupporterServer>;

export const staffsKeyValue = {
  robot: {
    name: "ROBOT",
    description: "Distopiaの代表兼創設者でDistopiaの全てのプログラムを作成",
    discordId: "1261634733037719593",
    links: [
      {
        url: "https://github.com/ro80t",
      },
      {
        url: "https://twitter.com/ro80t_dev",
      },
    ],
  },
  sumire: {
    name: "Sumire",
    description: "Distopiaのイラスト担当でDistopia内の全てのイラストを作成",
    discordId: "1309790121763143782",
    links: [
      {
        url: "https://www.tiktok.com/@sumire_8691",
      },
      {
        url: "https://twitter.com/sumire_8691",
      },
    ],
  },
} as const;

export const staffs = [staffsKeyValue.robot, staffsKeyValue.sumire] as const satisfies Array<Staff>;

export const DISCORD_INVITE_LINK = "https://discord.gg/QWUxsxWyYv";

export const CHARACTER_LIMIT = {
  description: 400,
  tag: 25,
  review: 150,
  searchTerm: 500,
} as const;

export const NUM_TAG_LIMIT = 5;
