export const mirrorCutAgent = {
    name: "Mirror-Cut Analyst",
    weight: 3.0,
    analyze(lastRes) {
        if (lastRes === null || lastRes === undefined) return 0;
        return (Number(lastRes) + 5) % 10;
    }
};