/* ==========================================================================
   MASTER-TRAP-FILTER.JS - V33.0 PRO (PSYCHOLOGY + SITUATIONAL)
   Responsibility: Ultimate Trap Detection & Operator Mind Reading
   ========================================================================== */

export const MasterTrapFilter = {
    
    // ১. পাবলিকের বায়াস (মানুষ কোন নম্বরে বেশি টাকা ঢালবে)
    getDynamicBias(historyArray) {
        if (!historyArray || historyArray.length < 5) return [1, 5, 0, 7];
        const recent = historyArray.slice(-3); // শেষের ৩টি গরম নম্বর
        return [...new Set([...recent, 5, 0, 7])];
    },

    // ২. বকেয়া নম্বর (সারাদিন আসেনি এমন নম্বর)
    getPendingTrap(historyArray) {
        let allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        return allDigits.filter(d => !historyArray.includes(d));
    },

    // ৩. দ্য মাস্টার ডিটেক্টর (Ultimate Trap Score)
    analyzeDigitSecurity(predictedDigit, agentConfidence, historyArray, operatorLostLastBaji = false) {
        let trapIntensity = 0;
        let reasons = [];

        const publicFavs = this.getDynamicBias(historyArray);
        const pendingTraps = this.getPendingTrap(historyArray);

        // রুল ১: অপারেটরের প্রতিশোধ (Operator's Revenge)
        // আগের বাজিতে পাবলিক জিতলে অপারেটর মারাত্মক ট্র্যাপ পাতবে
        if (operatorLostLastBaji) {
            trapIntensity += 40;
            reasons.push("OP_REVENGE (Operator lost last round, highly volatile)");
        }

        // রুল ২: হানি ট্র্যাপ (Honey Trap)
        // ১৮ জন এজেন্ট বলছে আসবে (Confidence > 85), আর পাবলিকেরও ওই নম্বর পছন্দ
        if (agentConfidence > 85 && publicFavs.includes(predictedDigit)) {
            trapIntensity += 50;
            reasons.push("HONEY_TRAP (Too obvious, massive load expected)");
        }

        // রুল ৩: কোল্ড ট্র্যাপ (Cold Trap)
        // মানুষ ভাবছে এই বকেয়া নম্বর এবার আসবেই, কিন্তু অপারেটর দেবে না
        if (pendingTraps.includes(predictedDigit)) {
            trapIntensity += 30;
            reasons.push("COLD_TRAP (Public betting on pending numbers)");
        }

        // রুল ৪: স্যান্ডউইচ বা প্যাটার্ন ট্র্যাপ (Pattern Trap)
        // টানা একই ধরনের প্যাটার্ন চললে অপারেটর হঠাৎ সেটা ভেঙে দেবে
        if (historyArray.length >= 3) {
            let last = historyArray[historyArray.length - 1];
            let secondLast = historyArray[historyArray.length - 2];
            let thirdLast = historyArray[historyArray.length - 3];
            
            // A-B-A Sandwich (যেমন: 2-7-2)
            if (last === thirdLast && last !== secondLast && predictedDigit === secondLast) {
                 trapIntensity += 30;
                 reasons.push("PATTERN_TRAP (Fake Sandwich series detected)");
            }
        }

        // ফাইনাল ডিসিশন
        if (trapIntensity >= 80) {
            return { alert: "CRITICAL_TRAP", action: "AVOID", dangerLevel: trapIntensity, reasons };
        } else if (trapIntensity >= 50) {
            return { alert: "MODERATE_TRAP", action: "CAUTION", dangerLevel: trapIntensity, reasons };
        } else {
            return { alert: "SAFE", action: "PLAY", dangerLevel: trapIntensity, reasons: ["Clear to proceed"] };
        }
    }
};
