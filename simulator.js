// simulator.js – অপারেটর সিমুলেটর টুল
import { GodEyeController } from './GodEyeController.js';
import { SituationRoom } from './situation-room.js';
import { LearningWeights } from './learning-weights.js';
import { OperatorProfiler } from './operatorProfiler.js';

// ==========================================================================
// 🎭 অপারেটর স্ট্র্যাটেজি সিমুলেটর
// ==========================================================================
export const OperatorSimulator = {
    
    // সিমুলেশন ফলাফল সংরক্ষণ
    results: [],
    
    // ১. এলোমেলো অপারেটর (Random)
    randomOperator(historyLength = 8) {
        return Array(historyLength).fill(0).map(() => Math.floor(Math.random() * 10));
    },
    
    // ২. প্যাটার্ন-ভিত্তিক অপারেটর (Pattern Based)
    patternOperator(history, basePattern) {
        // basePattern ধরে নিচ্ছি একটি অ্যারে [5,2,7,1,8,3,0,4]
        if (!basePattern) basePattern = [5,2,7,1,8,3,0,4];
        const nextIndex = history.length % basePattern.length;
        return basePattern[nextIndex];
    },
    
    // ৩. প্রতিশোধপরায়ণ অপারেটর (Revenge)
    revengeOperator(history, publicWins = 0) {
        if (publicWins >= 2) {
            // পাবলিক টানা জিতলে, অপারেটর ট্র্যাপ দেয়
            return [0,5,7][Math.floor(Math.random() * 3)];
        }
        return Math.floor(Math.random() * 10);
    },
    
    // ৪. ট্রেন্ড-অনুসারী অপারেটর (Trend Follower)
    trendOperator(history) {
        if (history.length < 3) return Math.floor(Math.random() * 10);
        const last = history.slice(-3);
        const avg = last.reduce((a,b) => a+b,0) / 3;
        if (avg >= 5) {
            // বড় ডিজিট বেশি এলে ছোট দেয়
            return Math.floor(Math.random() * 5);
        } else {
            // ছোট ডিজিট বেশি এলে বড় দেয়
            return 5 + Math.floor(Math.random() * 5);
        }
    },
    
    // ৫. দিন-সময় ভিত্তিক অপারেটর (Time Based)
    timeBasedOperator(bajiNum, dayOfWeek) {
        // রোববারে ভিন্ন প্যাটার্ন
        if (dayOfWeek === 0) {
            return [6,7,8,9,0][bajiNum % 5];
        }
        return [1,5,0,7,2,8,3,9][bajiNum % 8];
    },
    
    // ৬. কাস্টম অপারেটর (আপনার নিজের লজিক)
    customOperator(history, customLogic) {
        if (typeof customLogic === 'function') {
            return customLogic(history);
        }
        return Math.floor(Math.random() * 10);
    },
    
    // ========================================================================
    // সিমুলেশন চালানোর মূল ফাংশন
    // ========================================================================
    async runSimulation(options = {}) {
        const {
            strategy = 'random',      // অপারেটর স্ট্র্যাটেজি
            iterations = 100,         // কতবার সিমুলেশন চালাবে
            archiveDb = null,         // আর্কাইভ ডাটা (ঐচ্ছিক)
            basePattern = null,       // প্যাটার্নের জন্য বেস
            saveResults = true,       // ফলাফল সংরক্ষণ করবে?
            verbose = true            // বিস্তারিত লগ দেখাবে?
        } = options;
        
        console.log(`\n🎭 সিমুলেশন শুরু: ${strategy} অপারেটর (${iterations} বার)`);
        
        let correctPredictions = 0;
        let totalBets = 0;
        let strategyResults = [];
        
        for (let sim = 0; sim < iterations; sim++) {
            // সিমুলেটেড হিস্ট্রি তৈরি
            let simulatedHistory = [];
            
            for (let baji = 0; baji < 8; baji++) {
                // অপারেটরের ডিজিট নির্ধারণ
                let operatorDigit;
                switch (strategy) {
                    case 'random':
                        operatorDigit = this.randomOperator(1)[0];
                        break;
                    case 'pattern':
                        operatorDigit = this.patternOperator(simulatedHistory, basePattern);
                        break;
                    case 'revenge':
                        const publicWins = simulatedHistory.filter(d => d >= 5).length;
                        operatorDigit = this.revengeOperator(simulatedHistory, publicWins);
                        break;
                    case 'trend':
                        operatorDigit = this.trendOperator(simulatedHistory);
                        break;
                    case 'time':
                        operatorDigit = this.timeBasedOperator(baji, new Date().getDay());
                        break;
                    default:
                        operatorDigit = Math.floor(Math.random() * 10);
                }
                
                // প্রেডিকশন
                const resultsWithNull = [...simulatedHistory, ...Array(8 - simulatedHistory.length).fill(null)];
                const consensus = await GodEyeController.getFinalConsensus(
                    archiveDb, 
                    {}, 
                    baji + 1, 
                    resultsWithNull
                );
                
                const predictedMain1 = consensus.main[0]?.digit;
                const predictedMain2 = consensus.main[1]?.digit;
                const predictedGuard = consensus.guard?.digit;
                const predictedDigits = [predictedMain1, predictedMain2, predictedGuard].filter(d => d !== undefined);
                
                const isCorrect = predictedDigits.includes(operatorDigit);
                if (isCorrect) correctPredictions++;
                totalBets++;
                
                simulatedHistory.push(operatorDigit);
                
                if (verbose && sim < 5) {
                    console.log(`  সিম ${sim+1}, বাজি ${baji+1}: অপারেটর=${operatorDigit} | প্রেডিকশন=${predictedDigits.join(',')} | ${isCorrect ? '✅' : '❌'}`);
                }
            }
            
            strategyResults.push({
                simulation: sim + 1,
                history: [...simulatedHistory],
                correct: correctPredictions / totalBets * 100
            });
        }
        
        const accuracy = (correctPredictions / totalBets * 100).toFixed(2);
        
        const result = {
            strategy,
            iterations,
            totalBets,
            correctPredictions,
            accuracy,
            details: strategyResults
        };
        
        if (saveResults) {
            this.results.push(result);
        }
        
        console.log(`\n📊 সিমুলেশন ফলাফল (${strategy}):`);
        console.log(`মোট বাজি: ${totalBets}`);
        console.log(`সঠিক প্রেডিকশন: ${correctPredictions}`);
        console.log(`অ্যাকুরেসি: ${accuracy}%`);
        
        return result;
    },
    
    // ========================================================================
    // সব স্ট্র্যাটেজি একসাথে টেস্ট
    // ========================================================================
    async testAllStrategies(iterations = 50, archiveDb = null) {
        const strategies = ['random', 'pattern', 'revenge', 'trend', 'time'];
        const allResults = [];
        
        for (let strat of strategies) {
            const result = await this.runSimulation({
                strategy: strat,
                iterations,
                archiveDb,
                verbose: false,
                saveResults: false
            });
            allResults.push(result);
        }
        
        console.log('\n📈 সব স্ট্র্যাটেজির তুলনা:');
        console.table(allResults.map(r => ({
            Strategy: r.strategy,
            Accuracy: r.accuracy + '%',
            'Total Bets': r.totalBets
        })));
        
        return allResults;
    },
    
    // ========================================================================
    // ফলাফল রিসেট
    // ========================================================================
    resetResults() {
        this.results = [];
        console.log('🧹 সিমুলেশন ফলাফল রিসেট করা হয়েছে');
    },
    
    // ========================================================================
    // ফলাফল এক্সপোর্ট
    // ========================================================================
    exportResults() {
        const data = {
            date: new Date().toLocaleDateString('en-GB'),
            results: this.results
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulator-results-${data.date}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('📥 ফলাফল এক্সপোর্ট করা হয়েছে');
    }
};

// গ্লোবালি অ্যাক্সেস করার জন্য
window.OperatorSimulator = OperatorSimulator;