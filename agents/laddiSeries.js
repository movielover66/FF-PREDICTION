export const laddiSeriesAgent = {
    name: "Laddi Series Detector",
    weight: 2.5,
    analyze(history) {
        if (!history || history.length === 0) {
            console.log("📈 LaddiSeriesAgent: No history, returning default 1");
            return 1;
        }
        const last = Number(history[history.length - 1]);
        const result = (last + 1) % 10;
        console.log(`📈 LaddiSeriesAgent: last = ${last}, returning ${result}`);
        return result;
    }
};