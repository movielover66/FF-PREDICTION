/* ==========================================================================
   LOAD-FACTOR.JS - V33.0 PRO MAX (RADAR & BLIND SPOT)
   Responsibility: Identifying High-Risk Red Zones & Safest Betting Spots.
   ========================================================================== */

export const LoadFactor = {
    // ১. ডাইনামিক লোড এবং জোন অ্যানালাইসিস
    analyzeMarketLoad(digit, baseScore, historyArray = []) {
        let loadPercent = 0;
        let lastDigit = historyArray.length > 0 ? parseInt(historyArray[historyArray.length - 1]) : null;

        // 🔴 RED ZONE CALCULATION (টাকার পাহাড় যেখানে)
        if (digit === lastDigit) {
            loadPercent += 55; // রিপিট ট্র্যাপ (মানুষের প্রথম পছন্দ)
        }
        if (lastDigit !== null && digit === (lastDigit + 5) % 10) {
            loadPercent += 40; // কাট নম্বর ট্র্যাপ
        }
        if ([1, 5, 0, 7].includes(digit)) {
            loadPercent += 25; // সাইকোলজিক্যাল ফেভারিট নম্বর
        }
        
        // কারেন্ট বোর্ডে থাকা নম্বরগুলো চেক করা (Short-term memory)
        const recentNumbers = historyArray.slice(-5).map(Number);
        if (recentNumbers.includes(digit)) {
            loadPercent += 15;
        }

        // ২. জোনিং (Zoning)
        let zone = "NEUTRAL";
        let boost = 1.0;

        if (loadPercent >= 70) {
            zone = "RED_ZONE";
            boost = 0.5; // স্কোর অর্ধেক কমিয়ে দাও (বিপজ্জনক!)
        } else if (loadPercent <= 15) {
            zone = "BLIND_SPOT";
            boost = 1.6; // স্কোর বাড়িয়ে দাও (অপারেটর এখানে নজর দিচ্ছে না)
        }

        // ৩. ফাইনাল স্কোর অ্যাডজাস্টমেন্ট
        let finalScore = baseScore * boost;

        console.log(`📡 RADAR: Digit ${digit} | Load: ${loadPercent}% | Zone: ${zone} | Score Boost: ${boost}x`);

        return {
            finalScore: parseFloat(finalScore.toFixed(2)),
            loadPercent: loadPercent,
            zone: zone
        };
    },

    // ড্যাশবোর্ডের গ্রাফের জন্য লোড প্রোফাইল তৈরি
    generateLoadGraph(historyArray) {
        let graphData = {};
        for(let i = 0; i <= 9; i++) {
            // বেস লোড ১০-২০% (ন্যাচারাল পাবলিক সেন্টিমেন্ট)
            graphData[i] = this.analyzeMarketLoad(i, 100, historyArray).loadPercent;
        }
        return graphData;
    }
};
