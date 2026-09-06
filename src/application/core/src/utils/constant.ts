export type SupporterServer = {
  name: string;
  invite: string | null;
  // The supporter organization's own Discord server. Not a secret (guild IDs are public), and
  // separate from `invite` since an invite link can expire/rotate independently of the guild
  // itself.
  guildId: string;
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
    guildId: "903952397292953630",
  },
  cappuccino: {
    name: "Cappuccino",
    invite: "https://discord.gg/cappuccino",
    guildId: "999943767509434439",
  },
  hima: {
    name: "暇人鯖",
    invite: "https://discord.gg/8v43tgwvfQ",
    guildId: "957886649583415296",
  },
  lemon: {
    name: "大檸檬帝国",
    invite: "https://discord.gg/BgZddsVPMH",
    guildId: "838734004718665758",
  },
};

export const supporters = [
  supportersKeyValue.bread,
  supportersKeyValue.cappuccino,
  supportersKeyValue.hima,
  supportersKeyValue.lemon,
] as const satisfies Array<SupporterServer>;

export const SUPPORTER_SERVER_GUILD_IDS: string[] = supporters.map(
  (supporter) => supporter.guildId,
);

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

export const MAX_USER_BLACK_LIST_COUNT = 15;

export const NUM_BLACK_LIST_TAG_LIMIT = 10;

export const BLACK_LIST_LIMIT = {
  label: 50,
  description: 400,
  tag: 25,
} as const;
