export const loadFactorAgent = {
    name: "LoadFactor Shield",
    weight: 3.8,
    analyze(liveLoad) {
        if (!liveLoad || typeof liveLoad !== 'object') return 4; // ডিফল্ট
        const entries = Object.entries(liveLoad);
        if (entries.length === 0) return 4; // কোনো ডাটা নেই
        const sorted = entries.sort(([,a], [,b]) => a - b);
        return parseInt(sorted[0][0]); // সবচেয়ে কম লোডের ডিজিট
    }
};