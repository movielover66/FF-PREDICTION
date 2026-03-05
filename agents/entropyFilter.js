export const entropyAgent = {
    name: "Entropy Filter",
    weight: 1.8,
    analyze(data) {
        // data হলো currentResults (সাম্প্রতিক ডিজিটের অ্যারে)
        if (!data || data.length === 0) return 0; // ডিফল্ট
        
        try {
            // ফ্রিকোয়েন্সি কাউন্ট করা
            const freq = {};
            data.forEach(d => {
                if (d !== null && !isNaN(d)) {
                    freq[d] = (freq[d] || 0) + 1;
                }
            });
            
            // সবচেয়ে বেশি ফ্রিকোয়েন্সির ডিজিট খুঁজি (স্টেবল প্যাটার্ন)
            let maxCount = 0;
            let stableDigit = 0;
            for (let digit = 0; digit <= 9; digit++) {
                if (freq[digit] > maxCount) {
                    maxCount = freq[digit];
                    stableDigit = digit;
                }
            }
            
            console.log(`🌪️ EntropyAgent: Most stable digit = ${stableDigit} (appeared ${maxCount} times)`);
            return stableDigit;
            
        } catch (e) {
            console.error("EntropyAgent error:", e);
            return 0;
        }
    }
};