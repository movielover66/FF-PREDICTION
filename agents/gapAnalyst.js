export const gapAnalystAgent = {
    name: "Gap Analyst",
    weight: 2.4,
    analyze(history) {
        // history হলো currentResults (যেখানে null আছে)
        if (!history || history.length === 0) return 2; // ডিফল্ট
        
        try {
            // শুধু নন-নুল ভ্যালুগুলো নেওয়া
            const valid = history.filter(r => r !== null).map(Number);
            if (valid.length === 0) return 2;
            
            // প্রতিটি ডিজিটের শেষ দেখা হওয়ার ইনডেক্স খুঁজি
            const lastSeen = {};
            for (let i = 0; i < valid.length; i++) {
                lastSeen[valid[i]] = i;
            }
            
            // এখন বর্তমান ইনডেক্স = valid.length
            const currentIndex = valid.length;
            
            // সব ডিজিটের গ্যাপ হিসাব করি (কত ধাপ আগে দেখা গেছে)
            let maxGap = -1;
            let bestDigit = 2; // ডিফল্ট
            
            for (let digit = 0; digit <= 9; digit++) {
                const last = lastSeen[digit];
                const gap = (last !== undefined) ? (currentIndex - last - 1) : currentIndex; // যদি কখনো না আসে, গ্যাপ = currentIndex
                if (gap > maxGap) {
                    maxGap = gap;
                    bestDigit = digit;
                }
            }
            
            console.log(`📊 GapAnalyst: Most overdue digit = ${bestDigit} (gap = ${maxGap})`);
            return bestDigit;
            
        } catch (e) {
            console.error("GapAnalyst error:", e);
            return 2;
        }
    }
};