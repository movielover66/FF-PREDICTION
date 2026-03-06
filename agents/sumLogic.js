export const sumLogicAgent = {
    name: "SumLogic Engine",
    weight: 2.2,
    analyze(history) {
        // history হলো currentResults (ডিজিটের অ্যারে)
        if (!history || history.length === 0) {
            console.log("➕ SumLogicAgent: No history, returning default 5");
            return 5;
        }
        
        try {
            // শুধু সংখ্যাগুলো নেওয়া
            const valid = history.filter(r => r !== null).map(Number);
            if (valid.length === 0) {
                console.log("➕ SumLogicAgent: No valid digits, returning default 5");
                return 5;
            }
            
            // সব ডিজিটের যোগফল বের করে শেষ অঙ্ক বের করা
            const total = valid.reduce((sum, d) => sum + d, 0);
            const result = total % 10;
            
            console.log(`➕ SumLogicAgent: digits = [${valid.join(', ')}], sum = ${total}, returning ${result}`);
            return result;
            
        } catch (e) {
            console.error("➕ SumLogicAgent error:", e);
            return 5;
        }
    }
};