// agents/humanPsychologyAgent.js
import { OperatorProfiler } from '../operatorProfiler.js';
import { APP_CONFIG } from '../config.js';

export const humanPsychologyAgent = {
    name: "Human Psychology & Operator Mind",
    weight: 5.0,
    analyze(sessionContext) {
        const { 
            currentResults, 
            bajiNum, 
            dayOfWeek, 
            isHoliday, 
            marketLoad, 
            lastWinLoss,
            midTermTrend,    // নতুন
            longTermTrend    // নতুন
        } = sessionContext;

        let scores = Array(10).fill(0);

        // ১. অপারেটরের মুড (টানা জিত/হার)
        let operatorMood = "neutral";
        let recentLosses = 0;
        for (let i = currentResults.length - 1; i >= 0 && i >= currentResults.length - 3; i--) {
            if (currentResults[i] >= 5) recentLosses++;
        }
        if (recentLosses >= 2) operatorMood = "angry";
        else if (recentLosses === 0 && currentResults.length > 0) operatorMood = "happy";

        // ২. অপারেটর প্রোফাইল থেকে প্যাটার্ন
        const historical = OperatorProfiler.getHistoricalPattern(dayOfWeek, bajiNum);
        historical.forEach((prob, d) => scores[d] += prob * 20);

        // ৩. মাল্টি-টাইমস্কেল ট্রেন্ড
        if (midTermTrend) {
            midTermTrend.forEach((prob, d) => scores[d] += prob * 15);
        }
        if (longTermTrend) {
            longTermTrend.forEach((prob, d) => scores[d] += prob * 10);
        }

        // ৪. মার্কেট লোড (যে ডিজিটে বেশি বেট) - কনফিগ থ্রেশহোল্ড ব্যবহার করা হয়েছে
        if (marketLoad) {
            for (let [d, amount] of Object.entries(marketLoad)) {
                if (amount > APP_CONFIG.MARKET_LOAD_THRESHOLD) {
                    scores[Number(d)] -= 50;
                }
            }
        }

        // ৫. প্রতিশোধ/দয়া
        if (lastWinLoss === "public_win" && bajiNum < 7) {
            const highLoad = Object.entries(marketLoad)
                .filter(([_, a]) => a > APP_CONFIG.MARKET_LOAD_THRESHOLD)
                .map(([d]) => Number(d));
            return highLoad.length ? highLoad[0] : 5;
        } else if (lastWinLoss === "public_loss" && bajiNum < 7) {
            const fav = historical.indexOf(Math.max(...historical));
            return fav >= 0 ? fav : 0;
        }

        // ৬. মুড অনুযায়ী
        if (operatorMood === "angry") {
            const seen = new Set(currentResults);
            for (let d = 0; d <= 9; d++) if (!seen.has(d)) return d;
        } else if (operatorMood === "happy") {
            const freq = Array(10).fill(0);
            currentResults.forEach(d => freq[d]++);
            return freq.indexOf(Math.max(...freq));
        }

        // ৭. ডিফল্ট: অপারেটর প্রোফাইলের টপ
        const drift = OperatorProfiler.detectDrift();
        if (drift.drift) {
            const recent = OperatorProfiler.getRecentPattern();
            recent.forEach((prob, d) => scores[d] += prob * 30);
        }
        return scores.indexOf(Math.max(...scores));
    }
};
