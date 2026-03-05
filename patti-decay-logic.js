/* ==========================================================================
   PATTI-DECAY-LOGIC.JS - V33.0 PRO MAX (PRECISION FILTER)
   Responsibility: Filtering Pattis based on their historical 'Age' & 'Recency'.
   ========================================================================== */

export const PattiDecay = {
    // V33.0 Update: Archive থেকে সরাসরি লাস্ট ডেট খুঁজে নেবে
    calculateDecayScore(patti, archive) {
        if (!patti || !archive) return 50.0;

        let lastSeenDate = null;
        const allDates = Object.keys(archive).sort().reverse(); // নতুন থেকে পুরনো

        // ১. পাত্তিটি শেষ কবে এসেছিল খুঁজে বের করা
        for (let date of allDates) {
            const dayPattis = archive[date].pattis || [];
            if (dayPattis.includes(patti.toString())) {
                lastSeenDate = date;
                break;
            }
        }

        if (!lastSeenDate) return 95.0; // যদি ইতিহাসে কোনোদিন না এসে থাকে (Super Hot!)

        // ২. দিনের পার্থক্য বের করা
        const today = new Date();
        const diffDays = Math.ceil(Math.abs(today - new Date(lastSeenDate)) / (1000 * 60 * 60 * 24));

        console.log(`📉 DECAY: Patti [${patti}] was last seen ${diffDays} days ago.`);

        // ৩. V33.0 প্রো ডাইনামিক স্কোরিং
        if (diffDays > 45) return 99.0; // "Golden Age" - আসার সম্ভাবনা নিশ্চিত
        if (diffDays > 30) return 85.0; // "Ripe" - বেশ ভালো সম্ভাবনা
        if (diffDays > 15) return 60.0; // "Stable" - মোটামুটি
        if (diffDays <= 3)  return 10.0; // "Dead Zone" - মাত্রই এসেছে, এখন আসার চান্স নেই বললেই চলে

        return 50.0; 
    }
};
