export const repeatAgent = {
    name: "Repeat-Strike Logic",
    weight: 1.9,
    analyze(last) {
        return (last !== null && last !== undefined) ? Number(last) : 0;
    }
};