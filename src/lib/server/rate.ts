
export type RateData = {
    newMember: number;
    newMessage: number;
    vcMemberSum: number;
    vcMemberUpperTwo: number;
    activeMember: number;
    allMember: number;
};

class ActiveRate {
    public readonly h1 = 25;
    public readonly h2 = 2;
    public readonly h3 = 7;
    public readonly h4 = 5;
    public readonly h5 = 1;
    public readonly h6 = 35;

    constructor() {}

    public async calc(data: RateData) {
        const { newMember, newMessage, vcMemberSum, vcMemberUpperTwo, activeMember, allMember } = data;
        return Math.ceil((
            newMember * this.h1 +
            Math.log(newMessage + 1) * Math.cbrt(newMessage) * this.h2 +
            Math.log(vcMemberSum * this.h3 + 1) * vcMemberUpperTwo * this.h4 * Math.cbrt((vcMemberSum * this.h3) / (activeMember + 1)) +
            Math.log(activeMember + 1) * this.h5 +
            (Math.cbrt(allMember) - allMember ** 1.1 / (activeMember + 1))
        ) * this.h6)
    }
}

export const activeRate = new ActiveRate();
