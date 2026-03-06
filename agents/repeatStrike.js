export const repeatAgent = {
    name: "Repeat-Strike Logic",
    weight: 1.9,
    analyze(last) {
        const result = (last !== null && last !== undefined) ? Number(last) : 0;
        console.log(`🔁 RepeatAgent: last = ${last}, returning ${result}`);
        return result;
    }
};