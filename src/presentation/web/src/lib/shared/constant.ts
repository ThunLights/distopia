import githubIcon from "$lib/assets/service/github.webp";
import tiktokIcon from "$lib/assets/service/tiktok.webp";
import twitterIcon from "$lib/assets/service/twitter.webp";
import robotIcon from "$lib/assets/staff/robot.webp";
import sumireIcon from "$lib/assets/staff/sumire.webp";
import { staffsKeyValue as baseStaff } from "app-core/constant";

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
