export const tripleHeatAgent = {
    name: "Triple-Heat Tracker",
    weight: 2.3,
    analyze(recent) {
        // recent হলো সর্বশেষ কয়েকটি ডিজিট (যেমন শেষ ৩টি)
        if (!recent || recent.length === 0) return 8; // ডিফল্ট
        
        try {
            const valid = recent.filter(r => r !== null).map(Number);
            if (valid.length === 0) return 8;
            
            // ফ্রিকোয়েন্সি কাউন্ট
            const freq = {};
            valid.forEach(d => freq[d] = (freq[d] || 0) + 1);
            
            // সবচেয়ে বেশি ফ্রিকোয়েন্সির ডিজিট খুঁজি
            let maxFreq = 0;
            let hotDigit = 8;
            for (let d = 0; d <= 9; d++) {
                if (freq[d] > maxFreq) {
                    maxFreq = freq[d];
                    hotDigit = d;
                }
            }
            
            console.log(`🔥 TripleHeatAgent: Hottest digit = ${hotDigit} (freq ${maxFreq})`);
            return hotDigit;
            
        } catch (e) {
            console.error("TripleHeatAgent error:", e);
            return 8;
        }
    }
};