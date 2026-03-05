import { coldStorageAgent } from './agents/coldStorage.js';
import { entropyAgent } from './agents/entropyFilter.js';
import { fibonacciAgent } from './agents/fibonacci.js';
import { gapAnalystAgent } from './agents/gapAnalyst.js';
import { laddiSeriesAgent } from './agents/laddiSeries.js';
import { loadFactorAgent } from './agents/loadFactor.js';
import { mirrorCutAgent } from './agents/mirrorCut.js';
import { neighborAgent } from './agents/neighborTouch.js';
import { omegaAgent } from './agents/omegaFinal.js';
import { pattiDecayAgent } from './agents/pattiDecay.js';
import { repeatAgent } from './agents/repeatStrike.js';
import { sandwichAgent } from './agents/sandwichPattern.js';
import { sumLogicAgent } from './agents/sumLogic.js';
import { timeSlotAgent } from './agents/timeSlot.js';
import { tripleHeatAgent } from './agents/tripleHeat.js';
import { twinDayAgent } from './agents/twinDay.js';
import { vibrationAgent } from './agents/vibration.js';
import { zeroTrapAgent } from './agents/zeroTrap.js';
import { humanPsychologyAgent } from './agents/humanPsychologyAgent.js';

import { LearningWeights } from './learning-weights.js';
import { LoadFactor } from './load-factor.js';
import { EntropyFilter } from './entropy-filter.js';
import { MasterTrapFilter } from './master-trap-filter.js';
import { TwinDayClustering } from './twin-day-clustering.js';
import { PatternDiscoveryEngine } from './pattern-discovery-engine.js';
import { BacktestValidator } from './backtest-validator.js';
import { PerformanceTracker } from './performance-tracker.js';
import { OperatorProfiler } from './operatorProfiler.js'; // ✅ নতুন ইম্পোর্ট

export const SituationRoom = {
    async getConsensus(archiveDb, liveLoad, bajiNum, currentResultsWithNull) {
        try {
            console.log(`[SITUATION ROOM] >> Baji ${bajiNum}`);

            const currentResults = currentResultsWithNull.filter(r => r !== null).map(Number);
            const lastDigit = currentResults.length > 0 ? currentResults[currentResults.length - 1] : null;

            await LearningWeights.loadMemory();
            const weights = LearningWeights.getWeights();

            // ====================================================================
            // মাল্টি-টাইমস্কেল এনালাইসিস (নতুন)
            // ====================================================================
            // শর্ট-টার্ম: আজকের ফলাফল (currentResults) – ইতিমধ্যে আছে
            
            // মিড-টার্ম: গত ৭ দিনের ট্রেন্ড (OperatorProfiler.recentTrends থেকে)
            let midTermTrend = Array(10).fill(0);
            if (OperatorProfiler.recentTrends && OperatorProfiler.recentTrends.length > 0) {
                const recent7 = OperatorProfiler.recentTrends.slice(-7);
                let total = 0;
                const counts = Array(10).fill(0);
                recent7.forEach(day => {
                    day.results.forEach(d => {
                        counts[d]++;
                        total++;
                    });
                });
                if (total > 0) {
                    midTermTrend = counts.map(c => c / total);
                }
            }
            
            // লং-টার্ম: পুরো আর্কাইভ থেকে ফ্রিকোয়েন্সি (গত ৩০ দিন বা সব)
            let longTermTrend = Array(10).fill(0);
            if (archiveDb) {
                const allDates = Object.keys(archiveDb).sort().reverse();
                const recent30 = allDates.slice(0, 30); // শেষ ৩০ দিন
                let total = 0;
                const counts = Array(10).fill(0);
                recent30.forEach(date => {
                    const dayData = archiveDb[date];
                    if (dayData && dayData.results) {
                        dayData.results.forEach(r => {
                            const d = parseInt(r);
                            if (!isNaN(d)) {
                                counts[d]++;
                                total++;
                            }
                        });
                    }
                });
                if (total > 0) {
                    longTermTrend = counts.map(c => c / total);
                }
            }

            let scores = Array(10).fill(0);
            let votes = [];

            const addVote = (agentResult, weight, agentName = 'unknown') => {
                if (agentResult !== null && agentResult !== undefined && !isNaN(agentResult)) {
                    const digit = Number(agentResult);
                    if (digit >= 0 && digit <= 9) {
                        scores[digit] += weight;
                        votes.push({ agentName, digit, weight });
                        console.log(`✅ ${agentName} voted ${digit} +${weight.toFixed(2)}`);

                        if (window.lastActualDigit !== undefined) {
                            PerformanceTracker.logVote(agentName, digit, window.lastActualDigit, weight);
                        }
                    } else {
                        console.warn(`⚠️ ${agentName} returned out-of-range digit:`, agentResult);
                    }
                } else {
                    console.warn(`⚠️ ${agentName} returned invalid:`, agentResult);
                }
            };

            // ====================================================================
            // ১. আর্কাইভনির্ভর এজেন্ট
            // ====================================================================
            if (archiveDb) {
                addVote(coldStorageAgent.analyze(archiveDb), coldStorageAgent.weight * weights.LongTerm, 'coldStorage');
                addVote(gapAnalystAgent.analyze(currentResults), gapAnalystAgent.weight * weights.LongTerm, 'gapAnalyst');
                const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
                addVote(twinDayAgent.analyze(archiveDb, currentDate), twinDayAgent.weight * weights.LongTerm, 'twinDay');
                addVote(vibrationAgent.analyze(archiveDb), vibrationAgent.weight * weights.LongTerm, 'vibration');
                addVote(zeroTrapAgent.analyze(archiveDb), zeroTrapAgent.weight * weights.Logic, 'zeroTrap');
            }

            // ====================================================================
            // ২. শর্ট-টার্ম ও লজিক এজেন্ট
            // ====================================================================
            addVote(entropyAgent.analyze(currentResults), entropyAgent.weight * weights.ShortTerm, 'entropy');

            if (currentResults.length >= 2) {
                addVote(fibonacciAgent.analyze(currentResults[currentResults.length-1], currentResults[currentResults.length-2]),
                        fibonacciAgent.weight * weights.Logic, 'fibonacci');
            } else {
                addVote(fibonacciAgent.analyze(lastDigit, 5), fibonacciAgent.weight * weights.Logic, 'fibonacci');
            }

            addVote(laddiSeriesAgent.analyze(currentResults), laddiSeriesAgent.weight * weights.ShortTerm, 'laddiSeries');

            if (liveLoad && typeof liveLoad === 'object') {
                addVote(loadFactorAgent.analyze(liveLoad), loadFactorAgent.weight * weights.ShortTerm, 'loadFactor');
            }

            if (lastDigit !== null) {
                addVote(mirrorCutAgent.analyze(lastDigit), mirrorCutAgent.weight * weights.Logic, 'mirrorCut');
                addVote(neighborAgent.analyze(lastDigit), neighborAgent.weight * weights.Logic, 'neighbor');
                addVote(repeatAgent.analyze(lastDigit), repeatAgent.weight * weights.ShortTerm, 'repeat');
            }

            if (currentResults.length >= 3) {
                addVote(sandwichAgent.analyze(currentResults), sandwichAgent.weight * weights.Logic, 'sandwich');
            }

            addVote(timeSlotAgent.analyze(bajiNum), timeSlotAgent.weight * weights.Logic, 'timeSlot');
            addVote(tripleHeatAgent.analyze(currentResults.slice(-3)), tripleHeatAgent.weight * weights.ShortTerm, 'tripleHeat');
            addVote(sumLogicAgent.analyze(currentResults), sumLogicAgent.weight * weights.Logic, 'sumLogic');
            addVote(pattiDecayAgent.analyze(currentResults), pattiDecayAgent.weight * weights.ShortTerm, 'pattiDecay');

            // ====================================================================
            // ৩. টুইন ডে ক্লাস্টারিং
            // ====================================================================
            if (archiveDb) {
                const twinResult = TwinDayClustering.findTwinSequence(currentResults, archiveDb);
                if (twinResult && twinResult.topPredictions) {
                    twinResult.topPredictions.slice(0, 3).forEach(p => {
                        scores[p.digit] += p.count * 2;
                        votes.push({ agentName: 'TwinClustering', digit: p.digit, weight: p.count * 2 });
                        console.log(`👯 TwinClustering boosted digit ${p.digit} by ${p.count * 2}`);
                    });
                }
            }

            // ====================================================================
            // ৪. প্যাটার্ন ডিসকভারি
            // ====================================================================
            const pattern = PatternDiscoveryEngine.discoverAdvancedSeries(currentResults);
            if (pattern) {
                scores[pattern.digit] += pattern.strength * weights.Logic;
                votes.push({ agentName: 'PatternDiscovery', digit: pattern.digit, weight: pattern.strength * weights.Logic });
                console.log(`🔍 PatternDiscovery boosted digit ${pattern.digit} by ${pattern.strength * weights.Logic}`);
            }

            // ====================================================================
            // ৫. হিউম্যান সাইকোলজি এজেন্ট (মানসিকতা ও অপারেটর অভ্যাস) – আপডেটেড
            // ====================================================================
            try {
                const sessionContext = {
                    currentResults,
                    bajiNum,
                    dayOfWeek: new Date().getDay(),
                    isHoliday: false,
                    marketLoad: liveLoad || {},
                    archiveData: archiveDb,
                    lastWinLoss: window.lastWinLoss || 'unknown',
                    // নতুন টাইমস্কেল ফিচার
                    midTermTrend,      // গত ৭ দিনের ডিজিট ফ্রিকোয়েন্সি (শতাংশ)
                    longTermTrend      // গত ৩০ দিনের ডিজিট ফ্রিকোয়েন্সি (শতাংশ)
                };
                const humanVote = humanPsychologyAgent.analyze(sessionContext);
                addVote(humanVote, humanPsychologyAgent.weight * 2.0, 'humanPsychology');
            } catch (e) {
                console.error("humanPsychologyAgent error:", e);
            }

            // ====================================================================
            // ৬. ওমেগা ফাইনাল ফিল্টার
            // ====================================================================
            try {
                const omegaDigit = omegaAgent.analyze(scores);
                addVote(omegaDigit, omegaAgent.weight * 1.2, 'omegaFinal');
            } catch (e) {
                console.error("omegaAgent error:", e);
            }

            // ====================================================================
            // ৭. লোড ফ্যাক্টর অ্যাডজাস্টমেন্ট
            // ====================================================================
            scores = scores.map((score, digit) => {
                try {
                    const loadResult = LoadFactor.analyzeMarketLoad(digit, score, currentResults);
                    return loadResult.finalScore;
                } catch (e) {
                    console.error(`LoadFactor error for digit ${digit}:`, e);
                    return score;
                }
            });

            // ====================================================================
            // ৮. ট্র্যাপ ফিল্টার
            // ====================================================================
            scores = scores.map((score, digit) => {
                try {
                    const trap = MasterTrapFilter.analyzeDigitSecurity(digit, score, currentResults, false);
                    if (trap.alert === "CRITICAL_TRAP") return score * 0.2;
                    if (trap.alert === "MODERATE_TRAP") return score * 0.6;
                    return score;
                } catch (e) {
                    console.error(`MasterTrapFilter error for digit ${digit}:`, e);
                    return score;
                }
            });

            // ====================================================================
            // ৯. র্যাঙ্কিং
            // ====================================================================
            let ranked = Array.from({ length: 10 }, (_, i) => ({ digit: i, score: scores[i] }))
                .sort((a, b) => b.score - a.score);

            if (ranked[0].score === 0) {
                console.warn("⚠️ All scores are zero. Using fallback digits.");
                ranked = [
                    { digit: 5, score: 50 },
                    { digit: 0, score: 45 },
                    { digit: 2, score: 40 },
                    { digit: 7, score: 35 },
                    ...ranked.slice(4)
                ];
            }

            const top4 = ranked.slice(0, 4);

            const confidenceBoost = archiveDb ? BacktestValidator.validateCurrentStrategy(currentResults, archiveDb) : 85;
            const entropy = EntropyFilter.calculateMarketEntropy(currentResults);
            let confidence = Math.min(99, Math.round(entropy.score * 0.8 + confidenceBoost * 0.2));
            if (confidence < 70) confidence = 70;

            const logicText = `Top: ${top4[0].digit} (${Math.round(top4[0].score)} pts) | Entropy: ${entropy.status}`;

            return {
                main: top4.slice(0, 3).map(item => ({ digit: item.digit, score: item.score })),
                guard: { digit: top4[3].digit, score: top4[3].score },
                confidence: confidence,
                logic: logicText,
                votes: votes
            };

        } catch (error) {
            console.error("🔥 SituationRoom Fatal Error:", error);
            return {
                main: [
                    { digit: 5, score: 50 },
                    { digit: 0, score: 45 },
                    { digit: 2, score: 40 }
                ],
                guard: { digit: 7, score: 35 },
                confidence: 80,
                logic: "⚠️ System error, using fallback",
                votes: []
            };
        }
    }
};