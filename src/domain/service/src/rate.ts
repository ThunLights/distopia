import { useAsync } from "./async";

export type ActiveRateEvidence = {
  newMember: number;
  newMessage: number;
  vcMemberSum: number;
  vcMemberUpperTwo: number;
  activeMember: number;
  allMember: number;
};

export function calcActiveRateSync({
  newMember,
  newMessage,
  vcMemberSum,
  vcMemberUpperTwo,
  activeMember,
  allMember,
}: ActiveRateEvidence) {
  const h1 = 8;
  const h2 = 6;
  const h3 = 10;
  const h4 = 8;
  const h5 = 4;
  const h6 = 50;

  return Math.ceil(
    (newMember * h1 +
      Math.log(newMessage + 1) * Math.cbrt(newMessage) * h2 +
      Math.log(vcMemberSum * h3 + 1) *
        vcMemberUpperTwo *
        h4 *
        Math.cbrt((vcMemberSum * h3) / (activeMember + 1)) +
      Math.log(activeMember + 1) * h5 +
      (Math.cbrt(allMember) - allMember ** 1.1 / (activeMember + 1))) *
      h6,
  );
}

export const calcActiveRate = useAsync(calcActiveRateSync);
