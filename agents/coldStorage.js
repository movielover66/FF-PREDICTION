export const coldStorageAgent = {
    name: "Cold-Storage Analyst",
    weight: 2.0,
    analyze(archive) {
        // যদি আর্কাইভ না থাকে, তাহলে ডিফল্ট 3 রিটার্ন করি
        if (!archive) return 3;
        
        try {
            // সব ডিজিটের কাউন্ট ট্র্যাক করা
            const digitCount = {0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0};
            
            // আর্কাইভের সব দিনের রেজাল্ট সংগ্রহ
            const allDates = Object.keys(archive);
            allDates.forEach(date => {
                const dayData = archive[date];
                if (dayData && dayData.results) {
                    const results = Array.isArray(dayData.results) ? dayData.results : [dayData.results];
                    results.forEach(res => {
                        const num = parseInt(res);
                        if (!isNaN(num)) {
                            digitCount[num]++;
                        }
                    });
                }
            });
            
            // সবচেয়ে কম কাউন্ট যার (Cold Storage Digit)
            let minCount = Infinity;
            let coldDigit = 3; // ডিফল্ট
            
            for (let digit = 0; digit <= 9; digit++) {
                if (digitCount[digit] < minCount) {
                    minCount = digitCount[digit];
                    coldDigit = digit;
                }
            }
            
            console.log(`❄️ ColdStorageAgent: Least frequent digit is ${coldDigit} (appeared ${minCount} times)`);
            return coldDigit;
            
        } catch (e) {
            console.error("ColdStorage error:", e);
            return 3; // এরর হলে ডিফল্ট
        }
    }
};