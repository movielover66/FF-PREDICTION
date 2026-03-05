// analytics.js – Intelligence Monitoring Dashboard
import { PerformanceTracker } from './performance-tracker.js';
import { LearningWeights } from './learning-weights.js';
import { OperatorProfiler } from './operatorProfiler.js';

export const Analytics = {
    // ---------- ১. এজেন্ট পারফরম্যান্স টেবিল ----------
    renderAgentTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const report = PerformanceTracker.getDailyAccuracy();
        if (Object.keys(report).length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">📭 আজকের কোনো ডাটা নেই। প্রথমে কিছু বাজি খেলুন।</p>';
            return;
        }

        let html = '<table class="analytics-table">';
        html += '<tr><th>এজেন্ট</th><th>সঠিকতা</th><th>ওয়েট</th><th>ট্রেন্ড</th></tr>';
        
        Object.keys(report).sort().forEach(agent => {
            const data = report[agent];
            const acc = parseFloat(data.accuracy);
            const trend = this.getTrend(agent); // গত ৭ দিনের ট্রেন্ড (নিচে ফাংশন আছে)
            const trendIcon = trend > 0 ? '📈' : (trend < 0 ? '📉' : '➡️');
            const accClass = acc > 70 ? 'accuracy-high' : (acc < 40 ? 'accuracy-low' : '');
            
            html += `<tr>
                <td class="agent-name">${agent}</td>
                <td class="${accClass}">${data.accuracy}%</td>
                <td>${data.weight}</td>
                <td>${trendIcon} ${Math.abs(trend)}%</td>
            </tr>`;
        });
        html += '</table>';
        
        container.innerHTML = html;
    },

    // ---------- ২. অ্যাকুরেসি ট্রেন্ড গ্রাফ (গত ৭ দিন) ----------
    renderAccuracyTrend(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const history = this.getAccuracyHistory(); // লোকাল স্টোরেজ থেকে নিবে
        if (!history || history.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">📭 পর্যাপ্ত ডাটা নেই।</p>';
            return;
        }

        // ক্যানভাস তৈরি
        const canvas = document.createElement('canvas');
        canvas.id = 'accuracy-canvas';
        canvas.width = container.clientWidth;
        canvas.height = 150;
        container.innerHTML = '';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // ডাটা প্রস্তুত
        const days = history.map(d => d.date.slice(0, 5)); // DD-MM
        const accData = history.map(d => d.accuracy);

        // অক্ষ আঁকা
        ctx.strokeStyle = '#2a3340';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 10);
        ctx.lineTo(30, height - 20);
        ctx.lineTo(width - 10, height - 20);
        ctx.stroke();

        // গ্রাফ আঁকা
        const maxAcc = Math.max(...accData, 50);
        const minAcc = Math.min(...accData, 30);
        const xStep = (width - 50) / (days.length - 1);
        
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        accData.forEach((acc, i) => {
            const x = 40 + i * xStep;
            const y = height - 20 - ((acc - minAcc) / (maxAcc - minAcc)) * (height - 40);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // দিনের নাম লেখা
        ctx.fillStyle = '#95a5b9';
        ctx.font = '8px Inter';
        days.forEach((day, i) => {
            const x = 35 + i * xStep;
            ctx.fillText(day, x - 10, height - 5);
        });
    },

    // ---------- ৩. ডিজিট ফ্রিকোয়েন্সি চার্ট ----------
    renderDigitFrequency(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const freq = this.getDigitFrequency(); // লোকাল স্টোরেজ থেকে নিবে
        const canvas = document.createElement('canvas');
        canvas.id = 'digit-canvas';
        canvas.width = container.clientWidth;
        canvas.height = 150;
        container.innerHTML = '';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const barWidth = (width - 60) / 10;
        const maxFreq = Math.max(...Object.values(freq), 1);

        ctx.strokeStyle = '#2a3340';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 10);
        ctx.lineTo(30, height - 20);
        ctx.lineTo(width - 10, height - 20);
        ctx.stroke();

        for (let i = 0; i <= 9; i++) {
            const count = freq[i] || 0;
            const barHeight = (count / maxFreq) * (height - 40);
            const x = 40 + i * (barWidth + 5);
            const y = height - 20 - barHeight;

            ctx.fillStyle = i % 2 === 0 ? '#3b82f6' : '#10b981';
            ctx.fillRect(x, y, barWidth - 5, barHeight);
            
            ctx.fillStyle = '#95a5b9';
            ctx.font = '10px Inter';
            ctx.fillText(i.toString(), x + 5, height - 5);
            
            ctx.fillStyle = '#fff';
            ctx.font = '8px Inter';
            ctx.fillText(count.toString(), x + 5, y - 5);
        }
    },

    // ---------- ৪. ম্যানুয়াল ওয়েট স্লাইডার ----------
    renderWeightSliders(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const weights = LearningWeights.getWeights();
        const categories = ['LongTerm', 'ShortTerm', 'Logic'];
        
        let html = '<div style="margin-top:10px;">';
        categories.forEach(cat => {
            html += `
                <div style="margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span style="color:var(--accent-gold);">${cat}</span>
                        <span id="${cat}-value">${weights[cat].toFixed(2)}</span>
                    </div>
                    <input type="range" min="1" max="5" step="0.1" value="${weights[cat]}" 
                           onchange="Analytics.updateWeight('${cat}', this.value)"
                           style="width:100%;">
                </div>
            `;
        });
        html += '</div>';
        container.innerHTML = html;
    },

    // ওয়েট আপডেট (স্লাইডার থেকে কল হবে)
    async updateWeight(category, value) {
        const numVal = parseFloat(value);
        const weights = LearningWeights.getWeights();
        weights[category] = numVal;
        await LearningWeights.saveMemory();
        document.getElementById(`${category}-value`).innerText = numVal.toFixed(2);
        console.log(`✅ ${category} weight updated to ${numVal}`);
    },

    // ---------- ৫. ট্র্যাপ সেন্সিটিভিটি স্লাইডার ----------
    renderTrapSlider(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const sensitivity = window.trapSensitivity || 1.0;
        container.innerHTML = `
            <div style="margin-top:10px;">
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:var(--accent-gold);">ট্র্যাপ সেন্সিটিভিটি</span>
                    <span id="trap-value">${sensitivity.toFixed(1)}</span>
                </div>
                <input type="range" min="0" max="2" step="0.1" value="${sensitivity}" 
                       onchange="Analytics.updateTrapSensitivity(this.value)"
                       style="width:100%;">
                <p style="font-size:10px; color:var(--text-muted); margin-top:4px;">
                    ০ = ট্র্যাপ অফ, ১ = স্বাভাবিক, ২ = সর্বোচ্চ সক্রিয়
                </p>
            </div>
        `;
    },

    updateTrapSensitivity(value) {
        const numVal = parseFloat(value);
        window.trapSensitivity = numVal;
        document.getElementById('trap-value').innerText = numVal.toFixed(1);
        console.log(`🔧 Trap sensitivity set to ${numVal}`);
    },

    // ---------- ৬. ডাটা এক্সপোর্ট ----------
    exportData() {
        const report = PerformanceTracker.getDailyAccuracy();
        const weights = LearningWeights.getWeights();
        const digitFreq = this.getDigitFrequency();
        
        const data = {
            date: new Date().toLocaleDateString('en-GB'),
            accuracy: report,
            weights: weights,
            digitFrequency: digitFreq
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${data.date}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    // ---------- হেল্পার ফাংশন ----------
    getTrend(agentName) {
        // গত ৭ দিনের ট্রেন্ড বের করার সিম্পল ভার্সন (আপনার লোকাল স্টোরেজ লাগবে)
        return 0; // ডেমো
    },

    getAccuracyHistory() {
        // গত ৭ দিনের অ্যাকুরেসি হিস্টোরি (লোকাল স্টোরেজ থেকে)
        // ডেমো ডাটা
        return [
            { date: '01-03', accuracy: 45 },
            { date: '02-03', accuracy: 52 },
            { date: '03-03', accuracy: 48 },
            { date: '04-03', accuracy: 61 },
            { date: '05-03', accuracy: 58 },
            { date: '06-03', accuracy: 63 },
            { date: '07-03', accuracy: 67 }
        ];
    },

    getDigitFrequency() {
        // গত ৭ দিনের ডিজিট ফ্রিকোয়েন্সি (লোকাল স্টোরেজ থেকে)
        // ডেমো ডাটা
        return {0:12,1:8,2:15,3:10,4:9,5:18,6:14,7:20,8:11,9:13};
    }
};

// গ্লোবালি অ্যাক্সেস করার জন্য
window.Analytics = Analytics;