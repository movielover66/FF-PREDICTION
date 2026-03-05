export const laddiSeriesAgent = {
    name: "Laddi Series Detector",
    weight: 2.5,
    analyze(history) {
        if (!history || history.length === 0) return 1;
        const last = Number(history[history.length - 1]);
        return (last + 1) % 10;
    }
};