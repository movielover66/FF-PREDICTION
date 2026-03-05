/* ==========================================================================
   PSYCHOLOGY.JS - V33.0 PRO (ADVANCED MIND READER)
   Responsibility: Predicting Human Sentiment & Operator's Traps
   ========================================================================== */

export const PsychologyEngine = {
    
    // ১. মানুষের বর্তমান লোভ (Dynamic Public Bias)
    // মানুষ শুধু ফিক্সড নম্বর নয়, বরং হিস্ট্রি দেখে লোভ করে
    getDynamicBias(historyArray) {
        if (!historyArray || historyArray.length < 5) return [1, 5, 0]; // Default

        const recent = historyArray.slice(-5);
        let biasDigits = [];

        // মানুষ 'গরম' নম্বর পছন্দ করে (যেটা একটু আগে এসেছে)
        biasDigits.push(recent[recent.length - 1]); 
        
        // মানুষ 'লাকি' নম্বর পছন্দ করে
        biasDigits.push(5, 0, 7); 

        return [...new Set(biasDigits)]; // ডুপ্লিকেট বাদ দিয়ে লিস্ট
    },

    // ২. সারাদিন আসেনি এমন নম্বর (Cold Trap)
    getPendingTrap(historyArray) {
        let allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        // যে নম্বরগুলো আজ একবারও আসেনি, মানুষ সেগুলোতে প্রচুর টাকা লাগায়
        let pending = allDigits.filter(d => !historyArray.includes(d));
        return pending;
    },

    // ৩. অপারেটরের আসল ফাঁদ ডিটেক্টর (The Mind Game)
    analyzeOperatorTrap(bajiNumber, predictedDigit, historyArray, agentConfidence) {
        console.log(`🧠 PSYCHOLOGY: Reading Operator's Mind for Baji ${bajiNumber}...`);
        
        const publicFavs = this.getDynamicBias(historyArray);
        const pendingTraps = this.getPendingTrap(historyArray);
        
        let trapAlert = false;
        let reason = "";

        // রুল ১: ওভার-কনফিডেন্স ট্র্যাপ (Honey Trap)
        // যদি ১৮ জন এজেন্ট বলে এই নম্বরটা ১০০% আসবে এবং সেটা পাবলিকেরও পছন্দ হয়
        if (agentConfidence > 90 && publicFavs.includes(predictedDigit)) {
            trapAlert = true;
            reason = "HONEY_TRAP (Too obvious, operator will change it)";
        }

        // রুল ২: বকেয়া নম্বরের ফাঁদ (Cold Trap)
        // মানুষ ভাবছে সারাদিন আসেনি, এবার আসবেই! কিন্তু অপারেটর দেবে না।
        if (pendingTraps.includes(predictedDigit) && bajiNumber < 7) {
            trapAlert = true;
            reason = "COLD_TRAP (Public is betting heavily on this pending number)";
        }

        // রুল ৩: রিকভারি ফাঁদ (Desperation Hour - ৭ বা ৮ নম্বর বাজি)
        // মানুষ লস কভার করতে লাকি নম্বর (৫, ০) বা ডাবল ডিজিট খেলে
        if (bajiNumber >= 7 && [0, 5, 7, 8].includes(predictedDigit)) {
            trapAlert = true;
            reason = "RECOVERY_TRAP (Operator will give weird digits to steal recovery money)";
        }

        if (trapAlert) {
            console.log(`🚨 TRAP DETECTED: Digit [${predictedDigit}] blocked. Reason: ${reason}`);
            return { isTrap: true, dangerLevel: 95 }; // 95% chance of being a trap
        }

        return { isTrap: false, dangerLevel: 20 }; // Safe to play
    }
};
