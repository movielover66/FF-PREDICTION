export const vibrationAgent = {
    name: "Frequency Vibrator",
    weight: 2.2,
    analyze(archive) {
        if (!archive || typeof archive !== 'object') return 6; // ডিফল্ট
        
        try {
            // ফ্রিকোয়েন্সি কাউন্টার
            const freq = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
            
            // আর্কাইভের সব দিনের রেজাল্ট সংগ্রহ (শুধু সাম্প্রতিক ৩০ দিন ধরা যেতে পারে, কিন্তু সহজতার জন্য সব)
            const allDates = Object.keys(archive);
            allDates.forEach(date => {
                const dayData = archive[date];
                if (dayData && dayData.results) {
                    const results = Array.isArray(dayData.results) ? dayData.results : [dayData.results];
                    results.forEach(res => {
                        const num = parseInt(res);
                        if (!isNaN(num)) {
                            freq[num]++;
                        }
                    });
                }
            });
            
            // সর্বোচ্চ ফ্রিকোয়েন্সি খুঁজি
            let maxCount = 0;
            let vibDigit = 6; // ডিফল্ট
            for (let d = 0; d <= 9; d++) {
                if (freq[d] > maxCount) {
                    maxCount = freq[d];
                    vibDigit = d;
                }
            }
            
            console.log(`📳 VibrationAgent: Most frequent digit = ${vibDigit} (count ${maxCount})`);
            return vibDigit;
            
        } catch (e) {
            console.error("VibrationAgent error:", e);
            return 6;
        }
    }
};