export const timeSlotAgent = {
    name: "TimeSlot Behaviorist",
    weight: 2.6,
    analyze(bajiNum) {
        const result = bajiNum % 10;
        console.log(`⏰ TimeSlotAgent: bajiNum = ${bajiNum}, returning ${result}`);
        return result;
    }
};