// performance-tracker.js
export const PerformanceTracker = {
    // প্রতিটি এজেন্টের পারফরম্যান্স সংরক্ষণ
    agentStats: {},

    // এজেন্টের ভোট লগ করুন
    logVote(agentName, digit, actualDigit, weight) {
        if (!this.agentStats[agentName]) {
            this.agentStats[agentName] = { correct: 0, total: 0, weight: weight };
        }
        this.agentStats[agentName].total++;
        if (digit === actualDigit) {
            this.agentStats[agentName].correct++;
        }
    },

    // দৈনিক অ্যাকুরেসি হিসেব করুন
    getDailyAccuracy() {
        let report = {};
        for (let [name, stat] of Object.entries(this.agentStats)) {
            report[name] = {
                accuracy: (stat.correct / stat.total * 100).toFixed(1),
                weight: stat.weight
            };
        }
        return report;
    },

    // স্টোরেজ থেকে পুরনো ডাটা লোড
    loadFromStorage() {
        const saved = localStorage.getItem('ff_agent_stats');
        if (saved) this.agentStats = JSON.parse(saved);
    },

    // স্টোরেজে সেভ
    saveToStorage() {
        localStorage.setItem('ff_agent_stats', JSON.stringify(this.agentStats));
    }
};