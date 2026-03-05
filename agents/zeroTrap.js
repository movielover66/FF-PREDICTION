export const zeroTrapAgent = {
    name: "Zero Trap Finder",
    weight: 1.5,
    analyze(archive) {
        if (!archive || typeof archive !== 'object') return null;
        
        try {
            // তারিখগুলো সাজাই (নতুন থেকে পুরনো)
            const allDates = Object.keys(archive).sort().reverse();
            const recentDays = allDates.slice(0, 7); // শেষ ৭ দিন
            
            let zeroFound = false;
            for (let date of recentDays) {
                const dayData = archive[date];
                if (dayData && dayData.results) {
                    const results = Array.isArray(dayData.results) ? dayData.results : [dayData.results];
                    if (results.includes(0) || results.includes('0')) {
                        zeroFound = true;
                        break;
                    }
                }
            }
            
            if (!zeroFound) {
                console.log("0️⃣ ZeroTrapAgent: Zero not seen recently, predicting 0");
                return 0;
            } else {
                console.log("0️⃣ ZeroTrapAgent: Zero seen recently, skipping vote");
                return null; // ভোট দেয় না
            }
        } catch (e) {
            console.error("ZeroTrapAgent error:", e);
            return null;
        }
    }
};