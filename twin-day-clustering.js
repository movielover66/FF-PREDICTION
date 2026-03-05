/* ==========================================================================
   TWIN-DAY-CLUSTERING.JS - V33.0 PRO MAX (HISTORICAL CLONING)
   Responsibility: Finds exact historical matching days to predict the future.
   ========================================================================== */

export const TwinDayClustering = {
    // V33.0: ডাটাবেস কল না করে সরাসরি archive ডাটা নেবে (Zero Lag)
    findTwinSequence(currentResults, archive) {
        if (!currentResults || currentResults.length === 0) return null;
        if (!archive) return null;

        console.log(`⏱️ TIME MACHINE: Searching for historical twins of [${currentResults.join(', ')}]...`);

        let nextDigitCounts = {};
        let totalMatches = 0;

        const allDates = Object.keys(archive);

        // ৫ বছরের ডাটা স্ক্যান করা হচ্ছে
        allDates.forEach(date => {
            const dayData = archive[date];
            if (dayData && dayData.results) {
                const hist = Array.isArray(dayData.results) ? dayData.results : [dayData.results];
                
                // আজকের সিকোয়েন্সের সাথে একদম হুবহু মিল (Exact Match) চেক করা
                let isMatch = true;
                for(let i = 0; i < currentResults.length; i++) {
                    if (parseInt(hist[i]) !== currentResults[i]) {
                        isMatch = false;
                        break;
                    }
                }

                // যদি হুবহু মিলে যায় এবং ওই দিনে পরের বাজির রেজাল্ট থাকে
                if (isMatch && hist.length > currentResults.length) {
                    let nextDigit = parseInt(hist[currentResults.length]);
                    if (!isNaN(nextDigit)) {
                        // কোন ডিজিটটা কতবার এসেছে তার হিসাব রাখা
                        nextDigitCounts[nextDigit] = (nextDigitCounts[nextDigit] || 0) + 1;
                        totalMatches++;
                    }
                }
            }
        });

        if (totalMatches === 0) {
            console.log("⏱️ No Twin Day found in 5-year history.");
            return null; // কোনো যমজ দিন পাওয়া যায়নি
        }

        // কোন ডিজিটটা সবচেয়ে বেশিবার এসেছে সেটা বের করা (Sorting)
        let sortedPredictions = Object.keys(nextDigitCounts)
            .map(digit => ({
                digit: parseInt(digit),
                count: nextDigitCounts[digit],
                probability: ((nextDigitCounts[digit] / totalMatches) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count); // সবচেয়ে বেশি আসা ডিজিট উপরে

        console.log(`👯‍♂️ TWIN DAYS FOUND: ${totalMatches} matches! Top Prediction: ${sortedPredictions[0].digit} (${sortedPredictions[0].probability}%)`);
        
        return {
            totalMatches: totalMatches,
            topPredictions: sortedPredictions
        };
    }
};
