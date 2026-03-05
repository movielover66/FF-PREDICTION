import { db, ref, get, child, set } from './firebase-config.js';

export const LearningWeights = {
    currentWeights: { 
        LongTerm: 4.0,
        ShortTerm: 2.5,
        Logic: 2.0
    },

    async loadMemory() {
        try {
            const dbRef = ref(db);
            const snapshot = await get(child(dbRef, `AI_Memory/learned_weights`));
            if (snapshot.exists()) {
                this.currentWeights = snapshot.val();
                console.log("📥 AI Memory Loaded from Firebase:", this.currentWeights);
            } else {
                console.log("📝 No previous memory found. Starting fresh.");
            }
        } catch (err) {
            console.error("🔥 Memory Load Error:", err);
        }
    },

    getWeights() {
        return this.currentWeights;
    },

    async adjustWeights(successCount, totalBaji) {
        if (totalBaji === 0) return;
        const rate = (successCount / totalBaji) * 100;
        const clamp = (val) => Math.max(1.0, Math.min(5.0, val));
        console.log(`🧠 AI Analyzing Market... Win Rate: ${rate.toFixed(1)}%`);
        if (rate < 40) {
            this.currentWeights.ShortTerm = clamp(this.currentWeights.ShortTerm + 0.2);
            this.currentWeights.Logic = clamp(this.currentWeights.Logic + 0.1);
            this.currentWeights.LongTerm = clamp(this.currentWeights.LongTerm - 0.2);
            console.log("⚠️ Market Volatile! Focusing on Short-Term Patterns.");
        } else if (rate >= 70) {
            this.currentWeights.LongTerm = clamp(this.currentWeights.LongTerm + 0.2);
            console.log("✅ Market Stable! Boosting 5-Year Archive Power.");
        }
        await this.saveMemory();
    },

    // 🆕 নতুন মেথড: নির্দিষ্ট এজেন্টের ক্যাটাগরি অনুযায়ী ওয়েট অ্যাডজাস্ট করুন
    async adjustWeight(agentName, delta) {
        const clamp = (val) => Math.max(1.0, Math.min(5.0, val));
        
        // এজেন্ট ক্যাটাগরি নির্ধারণ
        const longTermAgents = ['coldStorage', 'gapAnalyst', 'twinDay', 'vibration'];
        const shortTermAgents = ['entropy', 'laddiSeries', 'repeat', 'tripleHeat', 'pattiDecay'];
        const logicAgents = ['fibonacci', 'mirrorCut', 'neighbor', 'sandwich', 'timeSlot', 'sumLogic', 'zeroTrap', 'omega'];
        
        // এজেন্টের নাম ছোট হাতের করে চেক
        const name = agentName.toLowerCase();
        
        if (longTermAgents.some(key => name.includes(key))) {
            this.currentWeights.LongTerm = clamp(this.currentWeights.LongTerm + delta);
            console.log(`⚖️ LongTerm weight ${delta > 0 ? '⬆️' : '⬇️'} ${delta} → ${this.currentWeights.LongTerm.toFixed(2)} (${agentName})`);
        } 
        else if (shortTermAgents.some(key => name.includes(key))) {
            this.currentWeights.ShortTerm = clamp(this.currentWeights.ShortTerm + delta);
            console.log(`⚖️ ShortTerm weight ${delta > 0 ? '⬆️' : '⬇️'} ${delta} → ${this.currentWeights.ShortTerm.toFixed(2)} (${agentName})`);
        } 
        else if (logicAgents.some(key => name.includes(key))) {
            this.currentWeights.Logic = clamp(this.currentWeights.Logic + delta);
            console.log(`⚖️ Logic weight ${delta > 0 ? '⬆️' : '⬇️'} ${delta} → ${this.currentWeights.Logic.toFixed(2)} (${agentName})`);
        } else {
            console.log(`⚠️ Unknown agent category: ${agentName}`);
            return;
        }
        
        // Firebase-এ সেভ করুন
        await this.saveMemory();
    },

    async saveMemory() {
        try {
            await set(ref(db, 'AI_Memory/learned_weights'), this.currentWeights);
            console.log("💾 AI Memory Saved to Firebase Successfully!");
        } catch (err) {
            console.error("🔥 Memory Save Error:", err);
        }
    }
};