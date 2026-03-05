export const omegaAgent = {
    name: "Omega-Final Filter",
    weight: 3.0,
    analyze(allVotes) {
        if (!allVotes) return 1;
        if (Array.isArray(allVotes)) {
            let maxScore = -1, best = 1;
            allVotes.forEach((score, digit) => {
                if (score > maxScore) { maxScore = score; best = digit; }
            });
            return best;
        } else {
            let maxScore = -1, best = 1;
            for (let [d, s] of Object.entries(allVotes)) {
                if (s > maxScore) { maxScore = s; best = parseInt(d); }
            }
            return best;
        }
    }
};