export const omegaAgent = {
    name: "Omega-Final Filter",
    weight: 3.0,
    analyze(allVotes) {
        if (!allVotes) {
            console.log("Ω OmegaAgent: No votes, returning default 1");
            return 1;
        }
        
        if (Array.isArray(allVotes)) {
            // allVotes হলো scores অ্যারে (length 10)
            console.log("Ω OmegaAgent scores:", allVotes);
            let maxScore = -1;
            let best = 1;
            allVotes.forEach((score, digit) => {
                if (score > maxScore) {
                    maxScore = score;
                    best = digit;
                }
            });
            console.log(`Ω OmegaAgent: Best digit = ${best} (score ${maxScore})`);
            return best;
        } else {
            // যদি অবজেক্ট হয়
            console.log("Ω OmegaAgent scores (object):", allVotes);
            let maxScore = -1;
            let best = 1;
            for (let [d, s] of Object.entries(allVotes)) {
                if (s > maxScore) {
                    maxScore = s;
                    best = parseInt(d);
                }
            }
            console.log(`Ω OmegaAgent: Best digit = ${best} (score ${maxScore})`);
            return best;
        }
    }
};