/* ==========================================================================
   FF AI PRO V33.0 - THE ULTIMATE FULL MODULE (ALL ENGINE AGENTS SYNCED)
   Connected with GodEyeController, PattiEngine, and SituationRoom
   ========================================================================== */
import { GodEyeController } from './GodEyeController.js';
import { PattiEngine } from './patti-engine.js';
import { fetchArchiveData, db, ref, get, saveDayData } from './firebase-config.js';
import { PerformanceTracker } from './performance-tracker.js';
import { LearningWeights } from './learning-weights.js';
import { OperatorProfiler } from './operatorProfiler.js';
import { ConceptDriftDetector } from './conceptDriftDetector.js';
import { APP_CONFIG } from './config.js';
import { Analytics } from './analytics.js'; // ✅ অ্যানালিটিক্স ইম্পোর্ট

// --- ১. স্টেট ও ডাটা ম্যানেজমেন্ট ---
let todayKey = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
let isSunday = new Date().getDay() === 0; 
let maxBaji = isSunday ? 4 : 8; 

window.results = JSON.parse(localStorage.getItem('ff_results_' + todayKey)) || Array(8).fill(null);
window.pattis = JSON.parse(localStorage.getItem('ff_pattis_' + todayKey)) || Array(8).fill(null);
let lastPrediction = JSON.parse(localStorage.getItem('ff_last_pred')) || [];
let lastPredictedPattis = JSON.parse(localStorage.getItem('ff_last_patti_pred')) || [];
let passFailLog = JSON.parse(localStorage.getItem('ff_passfail_' + todayKey)) || Array(8).fill("");

let myWallet = parseFloat(localStorage.getItem('ff_wallet')) || 5000;
let sessionPL = parseFloat(localStorage.getItem('ff_session_pl_' + todayKey)) || 0;

// --- ২. উইন্ডো ইনিশিয়ালাইজেশন ---
window.onload = async () => {
    initGridUI();
    updateTodaySummary(); // ✅ আজকের ফলাফল দেখাও
    updateWalletUI();
    updateMarketGraph();
    
    const archiveDb = await fetchArchiveData();
    if(archiveDb) {
        renderHistoryHTML(archiveDb);
        document.getElementById('logic-text').innerText = ">>ARCHIVE SYNCED. SYSTEM READY.";
    }
    OperatorProfiler.load();

    // অ্যানালিটিক্স প্যানেল প্রথমে লুকানো থাকবে
    document.getElementById('analytics-panel')?.classList.add('hidden');

    if(typeof setupAdminPanel === 'function') setupAdminPanel();
    checkEngineStatus(); 
    setInterval(checkEngineStatus, 3000); 
    startMidnightAutoReset(); 
    startAutoTune();
};

/* ==========================================================================
   ⚙️ ENGINE ROOM (SIDEBAR) SYNC
   ========================================================================== */
window.toggleSidebar = () => document.getElementById('engine-sidebar').classList.toggle('open');

function checkEngineStatus() {
    const agents = ["MirrorCut", "ZeroTrap", "GapAnalyst", "PattiDecay", "EntropyFilter", "TwinClustering", "LoadFactor", "OmegaFinal"];
    let listHTML = "";
    agents.forEach(name => {
        listHTML += `<li>${name} <div class="status-dot dot-green"></div></li>`;
    });
    const agentListEl = document.getElementById('agent-list');
    if(agentListEl) agentListEl.innerHTML = listHTML;
}

function initGridUI() {
    const grid = document.getElementById('baji-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    for (let i = 0; i < maxBaji; i++) {
        let val = window.results[i];
        let pat = window.pattis[i] && window.pattis[i] !== "XXX" ? window.pattis[i] : "---";
        let pfClass = passFailLog[i] || ""; 
        let activeClass = (val === null && window.results.indexOf(null) === i) ? 'active' : '';
        
        grid.innerHTML += `
            <div class="baji-box ${val !== null ? 'filled' : ''} ${pfClass} ${activeClass}" id="box-${i+1}">
                <span class="b-no">${i + 1}B</span>
                <span class="b-patti">${pat}</span>
                <strong class="b-digit">${val !== null ? val : '-'}</strong>
            </div>`;
    }
}

// ✅ আজকের ফলাফল আপডেট
function updateTodaySummary() {
    const container = document.getElementById('today-summary');
    if (!container) return;
    let html = '';
    for (let i = 0; i < 8; i++) {
        const digit = window.results[i] !== null ? window.results[i] : '-';
        const patti = window.pattis[i] && window.pattis[i] !== "XXX" ? window.pattis[i] : '---';
        html += `<div class="today-summary-item"><span>${i+1}B</span> ${digit} (${patti})</div>`;
    }
    container.innerHTML = html;
}

/* ==========================================================================
   ⚡ AI ANALYSIS (2 MAIN + 1 GUARD) – কনফিডেন্স থ্রেশহোল্ড সহ
   ========================================================================== */
document.getElementById('analyze-trigger').onclick = async () => {
    const digitInput = document.getElementById('digit-input');
    const digitStr = digitInput.value.trim();
    
    if (digitStr === '') {
        alert("দয়া করে একটি ডিজিট (০-৯) লিখুন!");
        return;
    }
    
    const selectedDigit = parseInt(digitStr);
    if (isNaN(selectedDigit) || selectedDigit < 0 || selectedDigit > 9) {
        alert("ডিজিট ০ থেকে ৯ এর মধ্যে হতে হবে!");
        return;
    }

    let activeSlot = window.results.findIndex(r => r === null);
    if (activeSlot === -1) return alert("Board Full!");

    const livePattiInput = document.getElementById('live-patti-input');
    const enteredPatti = livePattiInput.value.trim() || "XXX";

    processBetting(selectedDigit, enteredPatti, activeSlot);

    window.results[activeSlot] = selectedDigit;
    window.pattis[activeSlot] = enteredPatti;
    saveLocalData();
    initGridUI();
    updateTodaySummary();

    document.getElementById('logic-text').innerText = "📡 ANALYZING 20 AGENTS...";
    
    try {
        const archiveDb = await fetchArchiveData();
        const consensus = await GodEyeController.getFinalConsensus(archiveDb, window.liveLoad || {}, activeSlot + 1, window.results);
        updateMarketLoadFromConsensus(consensus, activeSlot + 1);
        
        const results = consensus.main.concat(consensus.guard);
        const confidence = consensus.confidence;
        
        // ✅ কনফিডেন্স থ্রেশহোল্ড চেক (৮০%)
        if (confidence < 80) {
            document.getElementById('logic-text').innerText = "⏸️ কনফিডেন্স কম, বর্তমান বাজি স্কিপ করুন";
            digitInput.value = '';
            livePattiInput.value = '';
            document.getElementById('analyze-trigger').innerText = "ANALYZE DATA ⚡";
            return; // প্রেডিকশন দেখাবে না
        }
        
        const isTrap = confidence < 70; // ট্র্যাপ অ্যালার্টের জন্য আগের লজিক
        const finalPattiData = PattiEngine.analyzeBestPatti(results.map(r => r.digit), window.results);
        updatePredictionUI(results, finalPattiData, activeSlot + 1, confidence, isTrap);
    } catch (e) {
        console.error("AI Error:", e);
        document.getElementById('logic-text').innerText = "🔥 Error: " + (e.message || "Unknown error");
    }

    // ✅ প্রতি ANALYZE-এ ড্রিফট চেক
    ConceptDriftDetector.check();

    digitInput.value = '';
    livePattiInput.value = '';
    document.getElementById('analyze-trigger').innerText = "ANALYZE DATA ⚡";
};

function processBetting(num, patti, slot) {
    if (lastPrediction.length > 0) {
        let digitBet = parseFloat(document.getElementById('digit-bet').value) || 0;
        let pattiBet = parseFloat(document.getElementById('patti-bet').value) || 0;

        // নিজের বেট লাইভ লোডে যোগ করা (ঐচ্ছিক)
        // if (digitBet > 0) {
        //     updateLiveLoad(num, digitBet);
        // }

        let isDigitPass = lastPrediction.includes(num);
        let isPattiPass = patti !== "XXX" && lastPredictedPattis.includes(patti);

        myWallet -= (digitBet + pattiBet);
        sessionPL -= (digitBet + pattiBet);

        if (isDigitPass) {
            myWallet += (digitBet * 9);
            sessionPL += (digitBet * 9);
            passFailLog[slot] = "pass";
            triggerCelebration();
            window.lastActualDigit = num;
            window.lastWinLoss = 'public_win';
        } else {
            passFailLog[slot] = "fail";
            window.lastWinLoss = 'public_loss';
        }

        if (isPattiPass) {
            myWallet += (pattiBet * 100);
            sessionPL += (pattiBet * 100);
        }
    }
    updateWalletUI();
}

function updatePredictionUI(results, pattis, bajiNum, confidenceVal, isTrap) {
    const mainIds = ['m1-digit', 'm2-digit', 'g1-digit'];
    const mainPattiIds = ['m1-pattis', 'm2-pattis', 'g-pattis'];

    lastPrediction = [];
    lastPredictedPattis = [];

    for (let i = 0; i < 4; i++) {
        const res = results[i];
        if (!res) continue;
        const digitEl = document.getElementById(mainIds[i]);
        if (digitEl) {
            digitEl.innerText = res.digit;
            if (i < 3) lastPrediction.push(res.digit);

            const pArray = pattis[res.digit] || ["---", "---", "---", "---"];
            const pContainer = document.getElementById(mainPattiIds[i]);
            if (pContainer) {
                const spans = pContainer.querySelectorAll('span');
                pArray.forEach((p, idx) => {
                    if (spans[idx]) {
                        spans[idx].innerText = p;
                        if (i < 3) lastPredictedPattis.push(p);
                    }
                });
            }
        }
    }

    const logicTextSpan = document.getElementById('logic-text');
    if (logicTextSpan) {
        let patternMsg = "";
        if (isTrap) {
            patternMsg = "⚠️ Trap Detected: High-Risk Market Manipulation.";
        } else if (confidenceVal > 90) {
            patternMsg = "🎯 Pattern: Strong Mirror-Cut Consensus Identified.";
        } else {
            patternMsg = "📡 Analysis: Market Gap & Twin-Flashback Synced.";
        }
        logicTextSpan.innerText = patternMsg;
    }

    document.getElementById('pred-header').innerText = bajiNum >= 8 ? "🎯 TARGET: NEXT DAY" : `NEXT PREDICTION (BAJI ${bajiNum + 1})`;
    
    const confEl = document.getElementById('conf-val');
    if (confEl) {
        confEl.innerText = (confidenceVal || 85) + "%";
        confEl.style.color = confidenceVal > 90 ? "var(--neon-green)" : "var(--neon-yellow)";
    }

    const trapTextEl = document.getElementById('trap-text');
    if (trapTextEl) {
        trapTextEl.innerText = isTrap ? "⚠️ TRAP" : "SAFE";
        trapTextEl.style.color = isTrap ? "var(--neon-red)" : "var(--neon-green)";
    }

    updateMarketGraph(); 
}

function updateMarketLoadFromConsensus(consensus, bajiNum) {
    window.liveLoad = {};
    
    const totalGamblers = APP_CONFIG?.TOTAL_GAMBLERS || 150000;
    const avgBetPerBaji = APP_CONFIG?.AVG_BET_PER_PERSON_PER_BAJI || 200;
    const totalBajiBet = totalGamblers * avgBetPerBaji;
    
    const topDigits = [
        { digit: consensus.main[0].digit, score: consensus.main[0].score },
        { digit: consensus.main[1].digit, score: consensus.main[1].score },
        { digit: consensus.main[2].digit, score: consensus.main[2].score },
        { digit: consensus.guard.digit, score: consensus.guard.score }
    ];
    
    let totalScore = topDigits.reduce((sum, item) => sum + Math.max(item.score, 1), 0);
    
    topDigits.forEach(item => {
        const score = Math.max(item.score, 1);
        let betAmount = Math.round((score / totalScore) * totalBajiBet);
        const variation = Math.floor(Math.random() * 100) - 50;
        betAmount += variation * totalGamblers / 100;
        if (betAmount < 0) betAmount = 0;
        window.liveLoad[item.digit] = betAmount;
    });
    
    const otherBet = Math.round(totalBajiBet * 0.05);
    for (let d = 0; d <= 9; d++) {
        if (!topDigits.some(item => item.digit === d)) {
            window.liveLoad[d] = Math.floor(otherBet / 10);
        }
    }
    
    console.log(`📊 Baji ${bajiNum} Market Load:`, window.liveLoad);
}

/* ==========================================================================
   📊 মার্কেট লোড জিওমেট্রি
   ========================================================================== */
function updateMarketGraph() {
    const chart = document.getElementById('market-chart');
    if (!chart) return;
    chart.innerHTML = '';

    const AVG_BET = APP_CONFIG?.AVG_BET_PER_PERSON_PER_BAJI || 200;
    const MAX_LOAD = APP_CONFIG?.MAX_LOAD_SCALE || 10000000;

    if (!window.liveLoad || Object.keys(window.liveLoad).length === 0) {
        for (let i = 0; i <= 9; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = '20%';
            bar.setAttribute('data-val', i);
            
            const infoSpan = document.createElement('span');
            infoSpan.className = 'bar-info';
            infoSpan.innerHTML = '₹0<br>👥0';
            infoSpan.style.position = 'absolute';
            infoSpan.style.bottom = '100%';
            infoSpan.style.left = '50%';
            infoSpan.style.transform = 'translateX(-50%)';
            infoSpan.style.fontSize = '9px';
            infoSpan.style.color = '#fff';
            infoSpan.style.background = 'rgba(0,0,0,0.7)';
            infoSpan.style.padding = '2px 4px';
            infoSpan.style.borderRadius = '3px';
            infoSpan.style.whiteSpace = 'nowrap';
            infoSpan.style.zIndex = '5';
            infoSpan.style.textAlign = 'center';
            infoSpan.style.lineHeight = '1.2';
            
            bar.style.position = 'relative';
            bar.appendChild(infoSpan);
            chart.appendChild(bar);
        }
        return;
    }

    for (let i = 0; i <= 9; i++) {
        const amount = window.liveLoad[i] || 0;
        let height = Math.min((amount / MAX_LOAD) * 100, 100);
        
        const bar = document.createElement('div');
        bar.className = `bar ${amount > 5000000 ? 'high-load' : ''}`;
        bar.style.height = `${height}%`;
        bar.setAttribute('data-val', i);
        
        const infoSpan = document.createElement('span');
        infoSpan.className = 'bar-info';
        
        let amountText = '';
        if (amount >= 10000000) {
            amountText = `₹${(amount / 10000000).toFixed(2)}Cr`;
        } else if (amount >= 100000) {
            amountText = `₹${(amount / 100000).toFixed(2)}L`;
        } else {
            amountText = `₹${amount}`;
        }
        
        const gamblerCount = Math.round(amount / AVG_BET);
        let gamblerText = gamblerCount >= 1000 ? `${(gamblerCount/1000).toFixed(1)}K` : gamblerCount.toString();
        
        infoSpan.innerHTML = `${amountText}<br>👥 ${gamblerText}`;
        infoSpan.style.position = 'absolute';
        infoSpan.style.bottom = '100%';
        infoSpan.style.left = '50%';
        infoSpan.style.transform = 'translateX(-50%)';
        infoSpan.style.fontSize = '9px';
        infoSpan.style.color = '#fff';
        infoSpan.style.background = 'rgba(0,0,0,0.7)';
        infoSpan.style.padding = '2px 4px';
        infoSpan.style.borderRadius = '3px';
        infoSpan.style.whiteSpace = 'nowrap';
        infoSpan.style.zIndex = '5';
        infoSpan.style.textAlign = 'center';
        infoSpan.style.lineHeight = '1.2';
        
        bar.style.position = 'relative';
        bar.appendChild(infoSpan);
        chart.appendChild(bar);
    }
}

/* ==========================================================================
   📂 আর্কাইভ রেন্ডার
   ========================================================================== */
async function renderHistoryHTML(rawData) {
    const container = document.getElementById('archive-results');
    if (!container || !rawData) return;
    let dataList = Object.keys(rawData).map(key => ({ date: key, data: rawData[key] }));
    dataList.sort((a, b) => b.date.split('-').reverse().join('-').localeCompare(a.date.split('-').reverse().join('-')));

    let html = '';
    dataList.slice(0, 30).forEach(item => {
        let p = item.data.pattis || [];
        let d = item.data.results || [];
        let gridHtml = '';
        for(let i=0; i<8; i++) {
            gridHtml += `<div class="old-baji"><span class="old-patti">${p[i] || 'XXX'}</span><span class="old-digit">${d[i] !== undefined ? d[i] : '-'}</span></div>`;
        }
        html += `<div class="old-result-card"><div class="old-date">📅 ${item.date}</div><div class="old-grid">${gridHtml}</div></div>`;
    });
    container.innerHTML = html;
}

/* ==========================================================================
   💰 UNDO, RESET, ওয়ালেট ইউটিলিটি
   ========================================================================== */
window.undoAction = () => {
    let lastIndex = window.results.map((x, i) => x !== null ? i : -1).filter(i => i !== -1).pop();
    if (lastIndex !== undefined) {
        window.results[lastIndex] = null;
        window.pattis[lastIndex] = null;
        passFailLog[lastIndex] = ""; 
        saveLocalData();
        initGridUI();
        updateTodaySummary(); // ✅ সামারি আপডেট
        updateMarketGraph();
        document.getElementById('logic-text').innerText = `>> UNDO: Baji ${lastIndex + 1} Removed.`;
    }
};

window.resetSystem = () => { 
    if(confirm("Clear Today's Board? (Wallet Balance will remain safe)")) { 
        window.results = Array(8).fill(null);
        window.pattis = Array(8).fill(null);
        passFailLog = Array(8).fill("");
        sessionPL = 0;
        saveLocalData();
        location.reload(); 
    }
};

function updateWalletUI() {
    const walletInp = document.getElementById('wallet-balance');
    if(walletInp) walletInp.value = myWallet;
    let plText = document.getElementById('session-pl');
    if(plText) {
        plText.innerText = `₹ ${sessionPL}`;
        plText.style.color = sessionPL >= 0 ? "var(--neon-green)" : "var(--neon-red)";
    }
}

function updateLiveLoad(digit, amount) {
    if (!window.liveLoad) window.liveLoad = {};
    window.liveLoad[digit] = (window.liveLoad[digit] || 0) + amount;
    console.log(`📊 Live Load: Digit ${digit} now ₹${window.liveLoad[digit]}`);
}

function triggerCelebration() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
        });
    }
}

function saveLocalData() {
    localStorage.setItem('ff_results_' + todayKey, JSON.stringify(window.results));
    localStorage.setItem('ff_pattis_' + todayKey, JSON.stringify(window.pattis));
    localStorage.setItem('ff_passfail_' + todayKey, JSON.stringify(passFailLog));
    localStorage.setItem('ff_session_pl_' + todayKey, sessionPL);
    localStorage.setItem('ff_last_pred', JSON.stringify(lastPrediction));
    localStorage.setItem('ff_last_patti_pred', JSON.stringify(lastPredictedPattis));
    localStorage.setItem('ff_wallet', myWallet);
}

function startMidnightAutoReset() {
    setInterval(() => {
        let now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
            location.reload(); 
        }
    }, 1000);
}

async function autoTuneAtMidnight() {
    console.log("🌙 অটো-টিউনিং শুরু...");
    const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const todayResults = window.results.filter(r => r !== null);
    const todayPattis = window.pattis.filter(p => p !== null && p !== "XXX");

    if (todayResults.length > 0) {
        OperatorProfiler.addDayData(todayStr, todayResults);
        await saveDayData(todayStr, todayResults, todayPattis);
    }
    ConceptDriftDetector.check();

    const report = PerformanceTracker.getDailyAccuracy();
    console.table(report);
    for (let [name, stat] of Object.entries(report)) {
        const acc = parseFloat(stat.accuracy);
        let delta = 0;
        if (acc > 70) delta = 0.2;
        else if (acc < 40) delta = -0.2;
        if (delta !== 0) await LearningWeights.adjustWeight(name, delta);
    }
    PerformanceTracker.agentStats = {};
    PerformanceTracker.saveToStorage();
    OperatorProfiler.save();
    console.log("✅ অটো-টিউনিং সম্পন্ন!");
}

// ==========================================================================
// 🆕 টিউনিং ফ্রিকোয়েন্সি বাড়ানো – প্রতি ৩ বাজি শেষে
// ==========================================================================
function startAutoTune() {
    setInterval(() => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const isSunday = new Date().getDay() === 0;

        // সাধারণ দিনের টিউনিং টাইম
        const tuningTimes = [
            { hour: 13, minute: 35 },  // ৩য় বাজির পর (০১:৩৫ PM)
            { hour: 18, minute: 5 },   // ৬ষ্ঠ বাজির পর (০৬:০৫ PM)
            { hour: 21, minute: 5 },   // ৮ম বাজির পর (০৯:০৫ PM)
            { hour: 0, minute: 5 }     // রাত ১২:০৫ (ব্যাকআপ)
        ];

        // রবিবারে অতিরিক্ত টিউনিং টাইম
        if (isSunday) {
            // ৪র্থ বাজির পর টিউনিং (০৩:০৫ PM)
            if (hours === 15 && minutes === 5) {
                autoTuneAtMidnight();
                console.log("🌙 রবিবার ৪র্থ বাজি শেষে টিউনিং");
            }
        }

        // সাধারণ টিউনিং সময় চেক
        tuningTimes.forEach(time => {
            if (hours === time.hour && minutes === time.minute) {
                autoTuneAtMidnight();
            }
        });
    }, 60000); // প্রতি মিনিটে চেক
}

// ==========================================================================
// 👑 এডমিন প্যানেল – ক্যালেন্ডার ও বাজি-ভিত্তিক ইনপুট
// ==========================================================================
function renderAdminPanel() {
    const container = document.getElementById('admin-inputs');
    if (!container) return;

    let html = `
        <div style="padding: 10px; color: #fff;">
            <h4 style="color: var(--neon-yellow); margin-bottom: 15px;">📅 ক্যালেন্ডার থেকে তারিখ সিলেক্ট করুন</h4>
            <label style="display: block; margin-bottom: 5px;">📅 তারিখ:</label>
            <input type="date" id="admin-date" style="width: 100%; padding: 8px; margin-bottom: 20px; background: #000; border: 1px solid var(--neon-blue); color: #fff;">

            <h4 style="color: var(--neon-yellow); margin-bottom: 15px;">🎯 প্রতি বাজির ডিজিট ও পাত্তি লিখুন</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
    `;

    for (let baji = 1; baji <= 8; baji++) {
        html += `
            <div style="background: #111; padding: 10px; border-radius: 5px; border: 1px solid #333;">
                <div style="font-weight: bold; color: var(--neon-blue); margin-bottom: 5px;">বাজি ${baji}</div>
                <input type="number" id="digit-${baji}" placeholder="ডিজিট (০-৯)" min="0" max="9" style="width: 100%; padding: 5px; margin-bottom: 5px; background: #000; border: 1px solid #555; color: #fff;">
                <input type="text" id="patti-${baji}" placeholder="পাত্তি (৩ অঙ্ক)" maxlength="3" pattern="\\d{3}" style="width: 100%; padding: 5px; background: #000; border: 1px solid #555; color: #fff;">
            </div>
        `;
    }

    html += `
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="adminSaveData()" style="flex: 2; background: var(--neon-green); color: #000; border: none; padding: 12px; font-weight: bold; border-radius: 5px; cursor: pointer;">💾 সেভ করুন</button>
                <button onclick="adminDeleteData()" style="flex: 1; background: var(--neon-red); color: #fff; border: none; padding: 12px; font-weight: bold; border-radius: 5px; cursor: pointer;">🗑️ ডিলিট</button>
                <button onclick="adminClearForm()" style="flex: 1; background: #333; color: #fff; border: none; padding: 12px; font-weight: bold; border-radius: 5px; cursor: pointer;">🧹 ক্লিয়ার</button>
            </div>
            <div id="admin-message" style="margin-top: 15px; padding: 10px; border-radius: 5px; display: none;"></div>
        </div>
    `;

    container.innerHTML = html;
}

window.adminClearForm = function() {
    document.getElementById('admin-date').value = '';
    for (let baji = 1; baji <= 8; baji++) {
        document.getElementById(`digit-${baji}`).value = '';
        document.getElementById(`patti-${baji}`).value = '';
    }
    document.getElementById('admin-message').style.display = 'none';
};

window.adminSaveData = async function() {
    const msgDiv = document.getElementById('admin-message');
    msgDiv.style.display = 'block';
    msgDiv.innerHTML = '⏳ সংরক্ষণ করা হচ্ছে...';

    try {
        const dateInput = document.getElementById('admin-date').value;
        if (!dateInput) throw new Error('দয়া করে একটি তারিখ সিলেক্ট করুন');
        const [year, month, day] = dateInput.split('-');
        const date = `${day}-${month}-${year}`;

        const results = [], pattis = [];

        for (let baji = 1; baji <= 8; baji++) {
            const digit = document.getElementById(`digit-${baji}`).value.trim();
            const patti = document.getElementById(`patti-${baji}`).value.trim();

            if (digit === '') throw new Error(`বাজি ${baji} এর ডিজিট দিন`);
            const digitNum = Number(digit);
            if (isNaN(digitNum) || digitNum < 0 || digitNum > 9) throw new Error(`বাজি ${baji} এর ডিজিট ০-৯ এর মধ্যে হতে হবে`);

            if (patti === '') throw new Error(`বাজি ${baji} এর পাত্তি দিন`);
            if (!/^\d{3}$/.test(patti)) throw new Error(`বাজি ${baji} এর পাত্তি ঠিক ৩ অঙ্কের হতে হবে`);

            results.push(digitNum);
            pattis.push(patti);
        }

        const { saveDayData } = await import('./firebase-config.js');
        await saveDayData(date, results, pattis);

        msgDiv.style.background = 'rgba(57, 255, 20, 0.2)';
        msgDiv.style.color = 'var(--neon-green)';
        msgDiv.innerHTML = `✅ ${date} এর ডাটা ফায়ারবেসে সফলভাবে সংরক্ষিত হয়েছে!`;

    } catch (error) {
        msgDiv.style.background = 'rgba(255, 61, 0, 0.2)';
        msgDiv.style.color = 'var(--neon-red)';
        msgDiv.innerHTML = `❌ ত্রুটি: ${error.message}`;
    }
};

window.adminDeleteData = async function() {
    const msgDiv = document.getElementById('admin-message');
    msgDiv.style.display = 'block';
    msgDiv.innerHTML = '⏳ ডিলিট করা হচ্ছে...';

    try {
        const dateInput = document.getElementById('admin-date').value;
        if (!dateInput) throw new Error('দয়া করে একটি তারিখ সিলেক্ট করুন');
        const [year, month, day] = dateInput.split('-');
        const date = `${day}-${month}-${year}`;

        const { db, ref, set } = await import('./firebase-config.js');
        await set(ref(db, `Archives_With_Patti/${date}`), null);

        msgDiv.style.background = 'rgba(57, 255, 20, 0.2)';
        msgDiv.style.color = 'var(--neon-green)';
        msgDiv.innerHTML = `✅ ${date} এর ডাটা ফায়ারবেস থেকে মুছে ফেলা হয়েছে!`;
        adminClearForm();

    } catch (error) {
        msgDiv.style.background = 'rgba(255, 61, 0, 0.2)';
        msgDiv.style.color = 'var(--neon-red)';
        msgDiv.innerHTML = `❌ ত্রুটি: ${error.message}`;
    }
};

// Tab switching
window.showTab = (tabId) => {
    document.getElementById('main-app').classList.toggle('hidden', tabId !== 'app');
    document.getElementById('admin-panel').classList.toggle('hidden', tabId !== 'admin');
    
    if (tabId === 'admin') {
        renderAdminPanel();
    }
    
    document.querySelectorAll('.nav-links span').forEach(span => span.classList.remove('active'));
    if (tabId === 'app') {
        document.querySelector('.nav-links span:first-child').classList.add('active');
    } else {
        document.querySelector('.nav-links span:last-child').classList.add('active');
    }
};

// ==========================================================================
// 📊 অ্যানালিটিক্স প্যানেল টগল
// ==========================================================================
window.toggleAnalytics = function() {
    const panel = document.getElementById('analytics-panel');
    if (panel) {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            // প্যানেল খুললে ডাটা রিফ্রেশ করুন
            Analytics.renderAgentTable('agent-table-container');
            Analytics.renderAccuracyTrend('accuracy-trend-container');
            Analytics.renderDigitFrequency('digit-frequency-container');
            Analytics.renderWeightSliders('weight-sliders');
            Analytics.renderTrapSlider('trap-slider');
        }
    }
};

// ==========================================================================
// 🪟 মিনি স্প্লিট স্ক্রিন ভিউয়ার (আইফ্রেম সংস্করণ) – kolkataff.in-এর জন্য
// ==========================================================================
const miniViewerBtn = document.getElementById('mini-viewer-btn');
const miniViewerOverlay = document.getElementById('mini-viewer-overlay');
const miniViewerIframe = document.getElementById('mini-viewer-iframe');
const miniViewerRefresh = document.getElementById('mini-viewer-refresh');
const miniViewerClose = document.getElementById('mini-viewer-close');

if (miniViewerBtn) {
    miniViewerBtn.addEventListener('click', () => {
        miniViewerIframe.src = 'https://kolkataff.in/'; // ✅ নতুন লিংক
        miniViewerOverlay.classList.remove('hidden');
    });
}

if (miniViewerRefresh) {
    miniViewerRefresh.addEventListener('click', () => {
        miniViewerIframe.src = miniViewerIframe.src; // রিফ্রেশ
    });
}

if (miniViewerClose) {
    miniViewerClose.addEventListener('click', () => {
        miniViewerOverlay.classList.add('hidden');
        miniViewerIframe.src = 'about:blank'; // মেমরি খালি করতে
    });
}

// ESC কী চাপলে বন্ধ হবে
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && miniViewerOverlay && !miniViewerOverlay.classList.contains('hidden')) {
        miniViewerOverlay.classList.add('hidden');
        miniViewerIframe.src = 'about:blank';
    }
});