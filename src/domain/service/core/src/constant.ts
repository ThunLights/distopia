export type SupporterServer = {
  name: string;
  invite: string;
};

export type Staff = {
  name: string;
  description: string;
  discordId: string;
  links: {
    url: string;
  }[];
};

export const supporters = [
  {
    name: "クリームパンと愉快な仲間たち",
    invite: "https://discord.gg/De8T2NS74X",
  },
  {
    name: "Mikan Soba Club",
    invite: "https://discord.gg/HaFhCWS2Kk",
  },
  {
    name: "Cappuccino",
    invite: "https://discord.gg/cappuccino",
  },
  {
    name: "暇人鯖",
    invite: "https://discord.gg/hima",
  },
  {
    name: "大檸檬帝国",
    invite: "https://discord.gg/BgZddsVPMH",
  },
] as const satisfies Array<SupporterServer>;

export const staffs = [
  {
    name: "ROBOT",
    description: "Distopiaの代表兼創設者でDistopiaの全てのプログラムを作成",
    discordId: "1261634733037719593",
    links: [
      {
        url: "https://github.com/ROBOTofficial",
      },
      {
        url: "https://twitter.com/AlwaysHarapan",
      },
    ],
  },
  {
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
] as const satisfies Array<Staff>;

export const DISCORD_INVITE_LINK = "https://discord.gg/QWUxsxWyYv";
