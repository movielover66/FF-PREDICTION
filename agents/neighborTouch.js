export const neighborAgent = {
    name: "Neighbor-Touch Analyst",
    weight: 1.6,
    analyze(last) {
        if (last === null || last === undefined) {
            console.log("🤝 NeighborAgent: last is null/undefined, returning 0");
            return 0;
        }
        const result = (Number(last) + 1) % 10;
        console.log(`🤝 NeighborAgent: last = ${last}, returning ${result}`);
        return result;
    }
};