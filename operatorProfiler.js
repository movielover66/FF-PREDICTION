// operatorProfiler.js – সুপার ইন্টেলিজেন্ট ভার্সন
export const OperatorProfiler = {
    profile: {
        byDayOfWeek: Array(7).fill().map(() => Array(10).fill(0)),
        byBajiNum: Array(9).fill().map(() => Array(10).fill(0)),
        totalDays: 0
    },
    recentTrends: [],
    markovChain: { 1: {}, 2: {}, 3: {} }, // অর্ডার ১,২,৩ এর জন্য চেইন
    patternChangeHistory: {}, // কোন সিকোয়েন্সের পর কতবার কী পরিবর্তন হয়েছে
    lastDriftScore: 0,

    // ----- আগের মেথডগুলো অপরিবর্তিত -----
    addDayData(date, results) {
        const day = new Date(date.split('-').reverse().join('-')).getDay();
        results.forEach((digit, index) => {
            const baji = index + 1;
            this.profile.byDayOfWeek[day][digit]++;
            this.profile.byBajiNum[baji][digit]++;
        });
        this.profile.totalDays++;
        this.recentTrends.push({ date, results });
        if (this.recentTrends.length > 30) this.recentTrends.shift();

        // নতুন ডাটা এলে মার্কভ চেইন আপডেট করা ভালো, কিন্তু প্রতিবার পুরো রি-বিল্ড না করে ইনক্রিমেন্টাল আপডেট করা কঠিন।
        // তাই আমরা যখন প্রয়োজন হবে তখন বিল্ড করব, অথবা এখানে হালকা আপডেট দিতে পারি। সহজতার জন্য আমরা আলাদা বিল্ড ফাংশন রাখছি।
    },

    getHistoricalPattern(day, baji) {
        if (this.profile.totalDays === 0) return Array(10).fill(0);
        const dayCounts = this.profile.byDayOfWeek[day];
        const bajiCounts = this.profile.byBajiNum[baji];
        return dayCounts.map((count, digit) => 
            (count + bajiCounts[digit]) / (2 * this.profile.totalDays)
        );
    },

    getRecentPattern() {
        const counts = Array(10).fill(0);
        let total = 0;
        this.recentTrends.forEach(day => {
            day.results.forEach(d => {
                counts[d]++;
                total++;
            });
        });
        return total ? counts.map(c => c / total) : Array(10).fill(0);
    },

    detectDrift() {
        if (this.recentTrends.length < 7) return { drift: false, score: 0 };
        const historical = this.getHistoricalPattern(new Date().getDay(), 1);
        const recent = this.getRecentPattern();
        let driftScore = 0;
        for (let d = 0; d < 10; d++) {
            driftScore += Math.abs(recent[d] - historical[d]);
        }
        this.lastDriftScore = driftScore;
        return { drift: driftScore > 0.2, score: driftScore };
    },

    // ----- নতুন ইন্টেলিজেন্ট মেথড -----

    // মার্কভ চেইন বিল্ড করা (পুরো আর্কাইভ থেকে)
    buildMarkovChain(archive) {
        if (!archive) return;
        // সব অর্ডার রিসেট
        this.markovChain = { 1: {}, 2: {}, 3: {} };

        for (let date in archive) {
            const results = archive[date].results;
            if (!results || results.length < 2) continue;

            // অর্ডার ১
            for (let i = 0; i < results.length - 1; i++) {
                const key = results[i].toString();
                const next = results[i+1];
                if (!this.markovChain[1][key]) this.markovChain[1][key] = Array(10).fill(0);
                this.markovChain[1][key][next]++;
            }

            // অর্ডার ২
            for (let i = 0; i < results.length - 2; i++) {
                const key = results[i] + ',' + results[i+1];
                const next = results[i+2];
                if (!this.markovChain[2][key]) this.markovChain[2][key] = Array(10).fill(0);
                this.markovChain[2][key][next]++;
            }

            // অর্ডার ৩
            for (let i = 0; i < results.length - 3; i++) {
                const key = results[i] + ',' + results[i+1] + ',' + results[i+2];
                const next = results[i+3];
                if (!this.markovChain[3][key]) this.markovChain[3][key] = Array(10).fill(0);
                this.markovChain[3][key][next]++;
            }
        }
    },

    // মার্কভ চেইন থেকে প্রেডিকশন (একটি নির্দিষ্ট অর্ডারে)
    predictWithMarkov(history, order = 2) {
        if (order < 1 || order > 3) return null;
        const key = history.slice(-order).join(',');
        const probs = this.markovChain[order][key];
        if (!probs) return null;

        const total = probs.reduce((a, b) => a + b, 0);
        if (total === 0) return null;

        let maxProb = 0, bestDigit = 0;
        for (let d = 0; d < 10; d++) {
            if (probs[d] > maxProb) {
                maxProb = probs[d];
                bestDigit = d;
            }
        }
        return { digit: bestDigit, confidence: maxProb / total };
    },

    // ইনভার্স মার্কভ – যে ডিজিট কম এসেছে তাকে বেশি গুরুত্ব দেওয়া
    inverseMarkov(history, order = 2) {
        const key = history.slice(-order).join(',');
        const probs = this.markovChain[order][key];
        if (!probs) return null;

        const total = probs.reduce((a, b) => a + b, 1); // শূন্য হলে 1 ধরা
        const inverseProbs = probs.map(p => (total - p) / (9 * total));
        let maxInv = 0, bestDigit = 0;
        for (let d = 0; d < 10; d++) {
            if (inverseProbs[d] > maxInv) {
                maxInv = inverseProbs[d];
                bestDigit = d;
            }
        }
        return { digit: bestDigit, confidence: maxInv };
    },

    // ট্রেন্ড অ্যানালাইসিস – কোন ডিজিটের ফ্রিকোয়েন্সি সাম্প্রতিক সময়ে বাড়ছে?
    getDigitTrend(digit, days = 30) {
        const recent = this.recentTrends.slice(-days);
        if (recent.length < 7) return 0;

        const firstWeek = recent.slice(0, 7).reduce((sum, day) => 
            sum + day.results.filter(d => d === digit).length, 0);
        const lastWeek = recent.slice(-7).reduce((sum, day) => 
            sum + day.results.filter(d => d === digit).length, 0);

        return lastWeek - firstWeek; // পজিটিভ মানে ট্রেন্ড বাড়ছে
    },

    // প্যাটার্ন চেঞ্জ ডিটেক্টর – নির্দিষ্ট সিকোয়েন্সের পরবর্তী ডিজিট কতবার বদলেছে
    trackPatternChanges() {
        const changes = {};
        for (let i = 0; i < this.recentTrends.length - 1; i++) {
            const today = this.recentTrends[i];
            const tomorrow = this.recentTrends[i+1];
            // শেষ ৩টি ডিজিটের সিকোয়েন্স
            const key = today.results.slice(-3).join(',');
            const nextDigit = tomorrow.results[0]; // পরের দিনের প্রথম বাজি
            if (!changes[key]) changes[key] = { total: 0, variations: {} };
            changes[key].total++;
            changes[key].variations[nextDigit] = (changes[key].variations[nextDigit] || 0) + 1;
        }
        this.patternChangeHistory = changes;
        return changes;
    },

    // স্মার্ট প্রেডিকশন – সবগুলো টুলের সমন্বয়ে একটি ভোট
    smartPrediction(history, archive) {
        // প্রয়োজনে মার্কভ চেইন বিল্ড করা (যদি না থাকে)
        if (Object.keys(this.markovChain[1]).length === 0 && archive) {
            this.buildMarkovChain(archive);
        }

        let scores = Array(10).fill(0);

        // ১. মার্কভ অর্ডার ১,২,৩ থেকে ভোট
        for (let order = 1; order <= 3; order++) {
            const pred = this.predictWithMarkov(history, order);
            if (pred) {
                scores[pred.digit] += pred.confidence * (order * 2); // অর্ডার বেশি হলে ওয়েট বেশি
            }
        }

        // ২. ইনভার্স মার্কভ (অপারেটর প্যাটার্ন ভাঙলে কাজে লাগে)
        const invPred = this.inverseMarkov(history, 2);
        if (invPred) {
            scores[invPred.digit] += invPred.confidence * 1.5;
        }

        // ৩. ট্রেন্ড অ্যানালাইসিস
        for (let d = 0; d < 10; d++) {
            const trend = this.getDigitTrend(d);
            if (trend > 0) scores[d] += trend * 0.5;
            else if (trend < 0) scores[d] += trend * 0.2; // নেতিবাচক ট্রেন্ড কম প্রভাব
        }

        // ৪. প্যাটার্ন চেঞ্জ – যে সিকোয়েন্স ঘন ঘন বদলায়, তার সম্ভাবনা কম
        const key = history.slice(-3).join(',');
        if (this.patternChangeHistory[key]) {
            const stats = this.patternChangeHistory[key];
            // যে ডিজিট কম এসেছে সেটিতে বেশি স্কোর
            for (let d = 0; d < 10; d++) {
                const count = stats.variations[d] || 0;
                const prob = count / stats.total;
                // ইনভার্স: যে কম এসেছে তার স্কোর বেশি
                scores[d] += (1 - prob) * 2;
            }
        }

        // সর্বোচ্চ স্কোরের ডিজিট বের করা
        let maxScore = -Infinity, bestDigit = 0;
        for (let d = 0; d < 10; d++) {
            if (scores[d] > maxScore) {
                maxScore = scores[d];
                bestDigit = d;
            }
        }
        return bestDigit;
    },

    // ----- লোড/সেভ আপডেট (নতুন প্রপার্টি সহ) -----
    load() {
        const saved = localStorage.getItem('ff_operator_profile');
        if (saved) Object.assign(this.profile, JSON.parse(saved));
        const savedTrends = localStorage.getItem('ff_recent_trends');
        if (savedTrends) this.recentTrends = JSON.parse(savedTrends);
        const savedMarkov = localStorage.getItem('ff_markov_chain');
        if (savedMarkov) this.markovChain = JSON.parse(savedMarkov);
        const savedChanges = localStorage.getItem('ff_pattern_changes');
        if (savedChanges) this.patternChangeHistory = JSON.parse(savedChanges);
        const savedDrift = localStorage.getItem('ff_last_drift_score');
        if (savedDrift) this.lastDriftScore = parseFloat(savedDrift);
    },

    save() {
        localStorage.setItem('ff_operator_profile', JSON.stringify(this.profile));
        localStorage.setItem('ff_recent_trends', JSON.stringify(this.recentTrends));
        localStorage.setItem('ff_markov_chain', JSON.stringify(this.markovChain));
        localStorage.setItem('ff_pattern_changes', JSON.stringify(this.patternChangeHistory));
        localStorage.setItem('ff_last_drift_score', this.lastDriftScore.toString());
    }
};