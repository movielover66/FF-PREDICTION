/* ==========================================================================
   PATTI-SUM-LOGIC.JS - V33.0 PRO (NUMERICAL DNA TRACKER)
   Responsibility: Filtering Pattis by their Sum (Total) patterns.
   ========================================================================== */

export const PattiSumLogic = {
    // ১. পাত্তির ডিএনএ (Sum) বের করা
    calculateSum(patti) {
        if (!patti) return null;
        const pStr = patti.toString();
        const sum = pStr.split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        return sum % 10; 
    },

    // ২. সাম ট্রেন্ড অ্যানালাইজার (Gap Analysis)
    analyzeSumTrend(archive) {
        const allDates = Object.keys(archive).sort().reverse().slice(0, 10);
        let sumsSeen = new Set();
        
        allDates.forEach(date => {
            const results = archive[date].pattis || [];
            results.forEach(p => sumsSeen.add(this.calculateSum(p)));
        });
        
        // কোন সামগুলো গত ১০ দিন আসেনি (Pending Sums)
        let allPossibleSums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let pendingSums = allPossibleSums.filter(s => !sumsSeen.has(s));
        
        return pendingSums;
    },

    // ৩. ফাইনাল ভ্যালিডেশন (The Filter)
    isPattiSumSafe(patti, pendingSums) {
        const pSum = this.calculateSum(patti);
        // যদি পাত্তির যোগফলটি পেন্ডিং লিস্টে থাকে, তবে সেটির পাওয়ার বুস্ট হবে
        return pendingSums.includes(pSum) ? 1.5 : 1.0;
    }
};
