export const sandwichAgent = {
    name: "Sandwich Pattern Detector",
    weight: 2.1,
    analyze(history) {
        // history হলো currentResults (শুধু সংখ্যা, null বাদ দেওয়া)
        if (!history || history.length < 3) return 5; // ডিফল্ট
        
        try {
            const last = history.length - 1;
            // স্যান্ডউইচ প্যাটার্ন: A B A (শেষ ও তার দুই আগের ডিজিট একই)
            if (history[last] === history[last - 2]) {
                const middle = history[last - 1];
                console.log(`🥪 SandwichAgent: Pattern detected, predicting middle = ${middle}`);
                return middle;
            }
            // অন্য কোনো প্যাটার্ন না পেলে ডিফল্ট
            return 5;
        } catch (e) {
            console.error("SandwichAgent error:", e);
            return 5;
        }
    }
};