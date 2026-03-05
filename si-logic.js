/* ==========================================================================
   SI-LOGIC.JS - V33.2 ULTRA (SUNDAY & HOLIDAY INTEGRATED)
   Responsibility: Multi-Layered Intelligence (Sunday Dominance + Regular Rules)
   Author: V33.0 Engine (Boss Edition)
   ========================================================================== */

export const SILogic = {
    // ১. সেশন টাইপ চেক (Sunday, Holiday, Weekend)
    getSessionIntel() {
        const now = new Date();
        const day = now.getDay();
        const hour = now.getHours();

        return {
            isSunday: day === 0,
            isWeekend: day === 0 || day === 6,
            isLateNight: hour >= 17, // বিকেল ৫টার পর থেকে নাইট মোড শুরু
            dayName: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][day]
        };
    },

    // ২. ডাইনামিক বুস্টার (সব লজিক এখানে একত্রে কাজ করবে)
    getDynamicBooster(digit, currentBaji, previousResults = []) {
        const intel = this.getSessionIntel();
        let boostScore = 0;

        // --- LAYER A: SUNDAY BIG-FIVE DOMINANCE (৬, ৭, ৮, ৯, ০) ---
        // আপনার ৫ বছরের ডাটা এবং ৩৪০/৩৬৫ দিনের রেকর্ড অনুযায়ী
        if (intel.isSunday) {
            const sundayBigFive = [6, 7, 8, 9, 0];
            if (sundayBigFive.includes(digit)) {
                boostScore += 50.0; // সবচেয়ে বড় বুস্ট (Priority 1)
            }

            // TRIPLE STRIKE LOGIC: যদি ৩ বা ৪ নম্বর বাজি হয় এবং অলরেডি বড় ঘর এসে থাকে
            const bigHitsSoFar = previousResults.filter(r => sundayBigFive.includes(r)).length;
            if (currentBaji >= 3 && bigHitsSoFar >= 1) {
                if (sundayBigFive.includes(digit)) boostScore += 20.0;
            }
        }

        // --- LAYER B: HOLIDAY & FESTIVAL LOGIC (১, ৬, ৪, ৯) ---
        // আপনার আগের ফাইলে থাকা অরিজিনাল হলিডে বুস্টার
        const holidayDigits = [1, 6, 4, 9];
        if (holidayDigits.includes(digit)) {
            boostScore += 20.0;
        }

        // --- LAYER C: LATE NIGHT RECOVERY (০ এবং ৫) ---
        // সন্ধ্যার পর জিরো এবং ফাইভের দাপট
        if (intel.isLateNight && (digit === 0 || digit === 5)) {
            boostScore += 15.0;
        }

        // --- LAYER D: ORIGINAL SUNDAY FAVS (১, ৬, ০, ৫) ---
        // আপনার আগের কোডের ১, ৬, ০, ৫ কেও রাখা হলো ব্যাকআপ হিসেবে
        if (intel.isSunday) {
            const oldSundayFavs = [1, 6, 0, 5];
            if (oldSundayFavs.includes(digit)) boostScore += 10.0;
        }

        return boostScore;
    },

    // ৩. শ্যাডো সাম পাত্তি ভ্যালিডেটর (Shadow Sum Logic)
    validateShadowSum(digit, patti) {
        const sum = patti.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        return (sum % 10) === digit;
    },

    // ৪. সেশন সিকিউরিটি চেক
    isSafeToPlay(currentBaji) {
        const intel = this.getSessionIntel();
        // রবিবারে ৪ বাজির পর রিস্ক বেড়ে যায় - এটি আপনার অরিজিনাল রুল
        if (intel.isSunday && currentBaji > 4) return false;
        return true;
    }
};
