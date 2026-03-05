import { OperatorProfiler } from './operatorProfiler.js';
import { LearningWeights } from './learning-weights.js';

export const ConceptDriftDetector = {
    async handleDrift() {
        const driftInfo = OperatorProfiler.detectDrift();
        if (driftInfo.drift) {
            console.warn("🚨 Concept Drift Detected! Adjusting weights...");
            // ShortTerm ও LongTerm ওয়েট ক্ল্যাম্পিং সহ আপডেট
            LearningWeights.currentWeights.ShortTerm = Math.max(1, Math.min(5, LearningWeights.currentWeights.ShortTerm * 1.2));
            LearningWeights.currentWeights.LongTerm = Math.max(1, Math.min(5, LearningWeights.currentWeights.LongTerm * 0.9));
            window.trapSensitivity = 'low';
            await LearningWeights.saveMemory(); // তাৎক্ষণিক সেভ
            localStorage.setItem('ff_last_drift', JSON.stringify({
                date: new Date().toISOString(),
                score: driftInfo.score,
                newWeights: { ...LearningWeights.currentWeights }
            }));
        }
    },
    check() { this.handleDrift(); }
};