import githubIcon from "$lib/assets/service/github.webp";
import tiktokIcon from "$lib/assets/service/tiktok.webp";
import twitterIcon from "$lib/assets/service/twitter.webp";
import robotIcon from "$lib/assets/staff/robot.webp";
import sumireIcon from "$lib/assets/staff/sumire.webp";
import breadIcon from "$lib/assets/supporter/bread.webp";
import cappuccinoIcon from "$lib/assets/supporter/cappuccino.webp";
import himaIcon from "$lib/assets/supporter/hima.webp";
import lemonIcon from "$lib/assets/supporter/lemon.webp";
import mikanIcon from "$lib/assets/supporter/mikan.gif";
import {
  staffsKeyValue as baseStaff,
  supportersKeyValue as baseSupporters,
} from "app-core/constant";

export * from "app-core/constant";

export type Staff = {
  name: string;
  description: string;
  icon: string;
  link: {
    icon: string;
    url: string;
  }[];
};

export type Supporter = {
  name: string;
  invite: string;
  icon: string;
};

export const staffs = [
  {
    ...baseStaff.robot,
    icon: robotIcon,
    link: [
      {
        icon: githubIcon,
        url: "https://github.com/ro80t",
      },
      {
        icon: twitterIcon,
        url: "https://twitter.com/ro80t_dev",
      },
    ],
  },
  {
    ...baseStaff.sumire,
    icon: sumireIcon,
    link: [
      {
        icon: tiktokIcon,
        url: "https://www.tiktok.com/@sumire_8691",
      },
      {
        icon: twitterIcon,
        url: "https://twitter.com/sumire_8691",
      },
    ],
  },
] satisfies Staff[];

export const supporters = [
  {
    ...baseSupporters.bread,
    icon: breadIcon,
  },
  {
    ...baseSupporters.mikan,
    icon: mikanIcon,
  },
  {
    ...baseSupporters.cappuccino,
    icon: cappuccinoIcon,
  },
  {
    ...baseSupporters.hima,
    icon: himaIcon,
  },
  {
    ...baseSupporters.lemon,
    icon: lemonIcon,
  },
] satisfies Supporter[];
