export const twinDayAgent = {
    name: "TwinDay Matcher",
    weight: 4.0,
    analyze(archive, currentDate) {
        if (!archive || typeof archive !== 'object') return 7;
        
        try {
            // currentDate ফরম্যাট DD-MM-YYYY (যেমন 02-03-2025)
            // archive-এর কীগুলোও একই ফরম্যাটে আছে ধরে নিচ্ছি
            const exactMatch = archive[currentDate];
            if (exactMatch && exactMatch.results) {
                const res = exactMatch.results;
                const digit = Array.isArray(res) ? res[res.length - 1] : res;
                console.log(`👯 TwinDayAgent: Exact match for ${currentDate}, returning ${digit}`);
                return parseInt(digit) || 7;
            }
            
            // যদি exact match না পাওয়া যায়, তবে সব কী-তে লুপ করে দেখি (কেস-ইনসেন্সিটিভ)
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
            console.error("TwinDayAgent error:", e);
            return 7;
        }
    }
};