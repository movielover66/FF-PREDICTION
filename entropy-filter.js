/* ==========================================================================
   ENTROPY-FILTER.JS - V33.0 PRO MAX (ULTIMATE CHAOS METER)
   Responsibility: Detects Market Volatility & Operator Panic Modes
   ========================================================================== */

export const EntropyFilter = {
    calculateMarketEntropy(resultsArray) {
        // ১. ব্ল্যাঙ্ক ডাটা ফিল্টার
        const valid = resultsArray.filter(r => r !== null && r !== undefined && r !== '');
        
        // দিনের শুরুতে মার্কেট সেফ থাকে
        if (valid.length < 3) return { score: 95.0, status: "⚡ GOD MODE: SAFE TO PLAY" };

        let uniqueCount = new Set(valid).size;
        let ratio = uniqueCount / valid.length;
        
        // ২. টানা রিপিট চেক (The Ultimate Red Flag)
        let consecutiveRepeats = 0;
        for (let i = 1; i < valid.length; i++) {
            if (valid[i] === valid[i - 1]) {
                consecutiveRepeats++;
            }
        }

        let entropyScore = 100.0;
        let marketStatus = "";

        // ৩. রিয়েল-টাইম মার্কেট লজিক
        if (consecutiveRepeats >= 2) {
            // যদি টানা ৩ বার একই সংখ্যা বা বারবার ডাবল মারে
            entropyScore = 20.0; 
            marketStatus = "🚨 EXTREME CHAOS: OPERATOR PANIC MODE";
        } 
        else if (ratio <= 0.5) {
            // যদি সারাদিন ধরে মাত্র গুটি কয়েক সংখ্যাই ঘোরে
            entropyScore = 40.0; 
            marketStatus = "⚠️ HIGH RISK: REPEATING TRAP DETECTED";
        } 
        else if (ratio === 1) {
            // যদি সব সংখ্যা আলাদা হয় (No Repeat)
            entropyScore = 85.0;
            marketStatus = "⚖️ MARKET STABLE: PURE RANDOM";
        } 
        else {
            // ব্যালেন্সড মার্কেট (AI এর প্যাটার্ন খোঁজার জন্য বেস্ট সময়)
            entropyScore = 99.0;
            marketStatus = "⚡ GOD MODE: PERFECT FOR AI PREDICTION";
        }

        console.log(`🌪️ ENTROPY: Ratio=${(ratio*100).toFixed(0)}%, Score=${entropyScore}, Status=[${marketStatus}]`);
        return { score: entropyScore, status: marketStatus, ratio: parseFloat(ratio.toFixed(2)) };
    }
};
