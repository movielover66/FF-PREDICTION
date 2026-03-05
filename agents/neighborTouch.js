export const neighborAgent = {
    name: "Neighbor-Touch Analyst",
    weight: 1.6,
    analyze(last) {
        if (last === null || last === undefined) return 0;
        return (Number(last) + 1) % 10;
    }
};