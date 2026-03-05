/* ==========================================================================
   PATTERN-DISCOVERY-ENGINE.JS - V33.0 PRO (ADVANCED DETECTIVE)
   Responsibility: Deep Sequence & Complex Series Tracking
   ========================================================================== */

export const PatternDiscoveryEngine = {
    // V33.0 Update: flattenedHistory (শেষ কয়েকদিনের সব রেজাল্ট একসাথে) নেবে
    discoverAdvancedSeries(historyArray) {
        if (!historyArray || historyArray.length < 4) return null;

        // শুধু একদম শেষের ৪টি বাজি নেবো (রিসেন্ট ট্রেন্ড)
        const recent = historyArray.slice(-4).map(Number);
        
        let p1 = recent[3]; // Last (Latest - একদম শেষের বাজি)
        let p2 = recent[2]; // 2nd Last
        let p3 = recent[1]; // 3rd Last
        let p4 = recent[0]; // 4th Last

        let detected = null;

        // ---------------------------------------------------------
        // ১. CONTINUOUS LADDI SERIES (যেমন: 2-3-4 -> টার্গেট 5)
        // ---------------------------------------------------------
        if (p1 === (p2 + 1) % 10 && p2 === (p3 + 1) % 10) {
            console.log("🔭 PATTERN: LONG UP-SERIES Detected!");
            detected = { type: "CONTINUOUS_UP_LADDI", digit: (p1 + 1) % 10, strength: 8.5 };
        }
        else if (p1 === (p2 - 1 + 10) % 10 && p2 === (p3 - 1 + 10) % 10) {
            console.log("🔭 PATTERN: LONG DOWN-SERIES Detected!");
            detected = { type: "CONTINUOUS_DOWN_LADDI", digit: (p1 - 1 + 10) % 10, strength: 8.5 };
        }

        // ---------------------------------------------------------
        // ২. JUMP / STEP SERIES (+2 / +3 গ্যাপ) (যেমন: 2-4-6 -> টার্গেট 8)
        // ---------------------------------------------------------
        if (!detected) {
            for (let step = 2; step <= 4; step++) {
                if (p1 === (p2 + step) % 10 && p2 === (p3 + step) % 10) { // Jump UP
                    console.log(`🔭 PATTERN: STEP UP SERIES (+${step})!`);
                    detected = { type: `JUMP_UP_${step}`, digit: (p1 + step) % 10, strength: 8.0 };
                    break;
                }
                if (p1 === (p2 - step + 10) % 10 && p2 === (p3 - step + 10) % 10) { // Jump DOWN
                    console.log(`🔭 PATTERN: STEP DOWN SERIES (-${step})!`);
                    detected = { type: `JUMP_DOWN_${step}`, digit: (p1 - step + 10) % 10, strength: 8.0 };
                    break;
                }
            }
        }

        // ---------------------------------------------------------
        // ৩. FIBONACCI ADDITIVE SERIES (A + B = C) (যেমন: 1, 3, 4 -> টার্গেট 7)
        // ---------------------------------------------------------
        if (!detected) {
            if (p1 === (p2 + p3) % 10 && p2 === (p3 + p4) % 10) {
                console.log("🔭 PATTERN: FIBONACCI ADDITIVE SERIES!");
                let nextTarget = (p1 + p2) % 10;
                detected = { type: "FIBONACCI_ADDITIVE", digit: nextTarget, strength: 9.5 }; // Very strong!
            }
        }

        // ---------------------------------------------------------
        // ৪. REPEATING TWIN SERIES (A-A-B-B -> টার্গেট C-C)
        // ---------------------------------------------------------
        if (!detected) {
            if (p1 === p2 && p3 === p4 && p1 !== p3) {
                let diff = (p1 - p3 + 10) % 10;
                let nextTwinStart = (p1 + diff) % 10;
                console.log("🔭 PATTERN: REPEATING TWIN SERIES!");
                detected = { type: "TWIN_STEP", digit: nextTwinStart, strength: 7.5 };
            }
        }

        // ---------------------------------------------------------
        // ৫. ZIG-ZAG ALTERNATING (High-Low-High-Low)
        // ---------------------------------------------------------
        if (!detected) {
            let isHigh = (n) => n >= 5;
            let isLow = (n) => n <= 4;
            
            if (isLow(p1) && isHigh(p2) && isLow(p3) && isHigh(p4)) {
                console.log("🔭 PATTERN: ZIG-ZAG (Expect HIGH next)!");
                let target = (p2 + 1 >= 5 && p2 + 1 <= 9) ? p2 + 1 : 8;
                detected = { type: "ZIG_ZAG_HIGH", digit: target, strength: 6.5 };
            } else if (isHigh(p1) && isLow(p2) && isHigh(p3) && isLow(p4)) {
                console.log("🔭 PATTERN: ZIG-ZAG (Expect LOW next)!");
                let target = (p2 + 1 <= 4) ? p2 + 1 : 2;
                detected = { type: "ZIG_ZAG_LOW", digit: target, strength: 6.5 };
            }
        }

        return detected;
    }
};
