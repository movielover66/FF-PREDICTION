export const gapAnalystAgent = {
    name: "Gap Analyst",
    weight: 2.4,
    analyze(history) {
        // history হলো currentResults (যেখানে null আছে)
        if (!history || history.length === 0) {
            console.log("📊 GapAnalyst: No history, returning default 2");
            return 2;
        }
        
        try {
            // শুধু নন-নুল ভ্যালুগুলো নেওয়া
            const valid = history.filter(r => r !== null).map(Number);
            if (valid.length === 0) {
                console.log("📊 GapAnalyst: No valid digits, returning default 2");
                return 2;
            }
            
            // প্রতিটি ডিজিটের শেষ দেখা হওয়ার ইনডেক্স খুঁজি
            const lastSeen = {};
            for (let i = 0; i < valid.length; i++) {
                lastSeen[valid[i]] = i;
            }
            
            // এখন বর্তমান ইনডেক্স = valid.length
            const currentIndex = valid.length;
            
            // সব ডিজিটের গ্যাপ হিসাব করি (কত ধাপ আগে দেখা গেছে)
            const gaps = Array(10).fill(0);
            for (let digit = 0; digit <= 9; digit++) {
                const last = lastSeen[digit];
                gaps[digit] = (last !== undefined) ? (currentIndex - last - 1) : currentIndex;
            }
            
            console.log("📊 GapAnalyst gaps:", gaps);
            
            let maxGap = -1;
            let bestDigit = 2; // ডিফল্ট
            
            for (let digit = 0; digit <= 9; digit++) {
                if (gaps[digit] > maxGap) {
                    maxGap = gaps[digit];
                    bestDigit = digit;
                }
            }
            
            console.log(`📊 GapAnalyst: Most overdue digit = ${bestDigit} (gap = ${maxGap})`);
            return bestDigit;
            
        } catch (e) {
            console.error("📊 GapAnalyst error:", e);
            return 2;
        }
    }
};