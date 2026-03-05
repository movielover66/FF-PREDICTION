export const timeSlotAgent = {
    name: "TimeSlot Behaviorist",
    weight: 2.6,
    analyze(bajiNum) {
        return bajiNum % 10; // নির্দিষ্ট বাজির আচরণ ট্র্যাক
    }
};
