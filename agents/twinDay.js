export const twinDayAgent = {
    name: "TwinDay Matcher",
    weight: 4.0,
    analyze(archive, currentDate) {
        if (!archive || typeof archive !== 'object') {
            console.log("👯 TwinDayAgent: No archive or invalid, returning 7");
            return 7;
        }
        
        try {
            console.log(`👯 TwinDayAgent: Searching for match for date: ${currentDate}`);
            console.log(`👯 TwinDayAgent: Archive keys sample:`, Object.keys(archive).slice(0, 5));
            
            // exact match খোঁজা
            const exactMatch = archive[currentDate];
            if (exactMatch && exactMatch.results) {
                const res = exactMatch.results;
                const digit = Array.isArray(res) ? res[res.length - 1] : res;
                console.log(`👯 TwinDayAgent: Exact match for ${currentDate}, returning ${digit}`);
                return parseInt(digit) || 7;
            }
            
            // Partial match খোঁজা (যদি ফরম্যাট একটু ভিন্ন হয়)
            const allDates = Object.keys(archive);
            const matchKey = allDates.find(key => key.includes(currentDate));
            if (matchKey && archive[matchKey] && archive[matchKey].results) {
                const res = archive[matchKey].results;
                const digit = Array.isArray(res) ? res[res.length - 1] : res;
                console.log(`👯 TwinDayAgent: Partial match found for ${currentDate} (key: ${matchKey}), returning ${digit}`);
                return parseInt(digit) || 7;
            }
            
            console.log(`👯 TwinDayAgent: No match for ${currentDate}, default 7`);
            return 7;
        } catch (e) {
            console.error("👯 TwinDayAgent error:", e);
            return 7;
        }
    }
};