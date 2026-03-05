// agents/pattiDecay.js
export const pattiDecayAgent = {
    name: "Patti-Decay Logic",
    weight: 3.2,
    analyze(pattiHistory) {
        // pattiHistory হলো currentResults (ডিজিটের অ্যারে)
        // আমরা ডিজিট লেভেলে ডিকে অ্যানালাইসিস করতে পারি
        if (!pattiHistory || pattiHistory.length === 0) return 2;
        
        try {
            const valid = pattiHistory.filter(r => r !== null).map(Number);
            if (valid.length === 0) return 2;
            
            // ফ্রিকোয়েন্সি কাউন্ট
            const freq = Array(10).fill(0);
            valid.forEach(d => freq[d]++);
            
            // সবচেয়ে কম ফ্রিকোয়েন্সির ডিজিট (ডিজিট বেশি ডিকে হয়েছে)
            let minFreq = Infinity;
            let decayDigit = 2;
            for (let d = 0; d <= 9; d++) {
                if (freq[d] < minFreq) {
                    minFreq = freq[d];
                    decayDigit = d;
                }
            }
            
            console.log(`📉 PattiDecayAgent: Least frequent digit = ${decayDigit} (appeared ${minFreq} times)`);
            return decayDigit;
        } catch (e) {
            console.error("PattiDecayAgent error:", e);
            return 2;
        }
    }
};