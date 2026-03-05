/* ==========================================================================
   PATTI-ENGINE.JS - V33.0 PRO MAX (ULTIMATE TIME-SYNC)
   Responsibility: Final 4 Patti Selection, Mirror Logic & CP Generation.
   ========================================================================== */

export const PattiEngine = {
    PATTI_DB: {
        0: ["127", "235", "190", "389", "479", "569"],
        1: ["128", "137", "236", "489", "579", "678"],
        2: ["129", "138", "237", "147", "589", "679"], 
        3: ["120", "139", "238", "148", "689", "788"],
        4: ["130", "149", "239", "158", "671", "789"],
        5: ["456", "140", "159", "230", "690", "780"], 
        6: ["150", "169", "240", "123", "790", "899"],
        7: ["124", "160", "250", "340", "890", "179"], 
        8: ["170", "189", "260", "350", "800", "440"], 
        9: ["180", "199", "270", "360", "450", "126"]
    },

    MIRROR_MAP: {0:5, 1:6, 2:7, 3:8, 4:9, 5:0, 6:1, 7:2, 8:3, 9:4},

    // ১. মূল পাত্তি সিলেকশন ইঞ্জিন
    analyzeBestPatti(targetDigits, historyArray) {
        let finalResults = {};
        
        // 🛠️ CORRECTION: null ভ্যালু বাদ দিয়ে শুধুমাত্র খেলা হওয়া ডিজিটগুলো নেওয়া হলো
        const validHistory = historyArray.filter(h => h !== null).map(String);
        const mirrorHits = validHistory.map(num => String(this.MIRROR_MAP[Number(num)]));

        targetDigits.forEach(d => {
            let pool = [...(this.PATTI_DB[d] || [])];
            let mirrorD = this.MIRROR_MAP[d];
            
            // মিরর ডিজিটের পাত্তিও পুলে যোগ করা
            if (this.PATTI_DB[mirrorD]) pool.push(...this.PATTI_DB[mirrorD]);

            let scored = pool.map(p => {
                let score = 0;
                let pArray = p.split('');
                let pSum = pArray.map(Number).reduce((a, b) => a + b, 0) % 10;

                // লজিক ১: শ্যাডো লজিক (মেইন ডিজিটের সাথে সাম মিললে)
                if (pSum === Number(d)) score += 75; 
                
                // লজিক ২: হিস্ট্রি ম্যাচ
                pArray.forEach(digit => {
                    if (validHistory.includes(digit)) score += 18;
                    if (mirrorHits.includes(digit)) score += 12;
                });

                // লজিক ৩: ইউনিক পাত্তি বোনাস
                if (new Set(pArray).size === 3) score += 35;

                return { patti: p, weight: score };
            });

            // ২. ডুপ্লিকেট রিমুভ এবং টপ ৪টি বাছাই
            finalResults[d] = scored.sort((a, b) => b.weight - a.weight)
                .filter((v, i, a) => a.findIndex(t => t.patti === v.patti) === i)
                .slice(0, 4)
                .map(item => item.patti);
            
            // ব্যাকআপ লজিক
            while (finalResults[d].length < 4) {
                finalResults[d].push("---");
            }
        });
        return finalResults;
    },

    // ৩. সাইকেল পাত্তি (CP) মেকার
    generateCP(allPattis) {
        if (!allPattis || allPattis.length === 0) return "---";
        let freq = {}; 
        allPattis.join('').split('').forEach(d => freq[d] = (freq[d] || 0) + 1);
        return Object.keys(freq).sort((a, b) => freq[b] - freq[a]).slice(0, 3).join('-');
    },

    // ৪. স্ট্যাটিক কলিং ফাংশন
    getBullets(digit) {
        return this.PATTI_DB[digit] ? this.PATTI_DB[digit].slice(0, 4) : ["---", "---", "---", "---"];
    }
};
